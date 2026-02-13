import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { expect, jest } from '@jest/globals';

import { FormComponent } from './form.component';
import { SessionService } from '../../../../services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from '../../../../services/teacher.service';

describe('FormComponent', () => {

  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  const mockRouter = {
    navigate: jest.fn(),
    url: ''
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jest.fn().mockReturnValue('1')
      }
    }
  };

  const mockSnackBar = {
    open: jest.fn()
  };

  const mockSessionService = {
    sessionInformation: {
      admin: true
    }
  };

  const mockSessionApiService = {
    detail: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  };

  const mockTeacherService = {
    all: jest.fn().mockReturnValue(of([]))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
      declarations: [FormComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;

    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect if not admin', () => {
    mockSessionService.sessionInformation.admin = false;

    component.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  it('should init form in create mode', () => {
    mockSessionService.sessionInformation.admin = true;
    mockRouter.url = '/sessions/create';

    component.ngOnInit();

    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm).toBeDefined();
  });

  it('should init form in update mode', () => {

    const mockSession = {
      name: 'Yoga',
      date: new Date().toISOString(),
      teacher_id: 2,
      description: 'Desc'
    };

    mockRouter.url = '/sessions/update/1';
    mockSessionApiService.detail.mockReturnValue(of(mockSession));

    component.ngOnInit();

    expect(component.onUpdate).toBe(true);
    expect(mockSessionApiService.detail).toHaveBeenCalledWith('1');
    expect(component.sessionForm?.value.name).toBe('Yoga');
  });

  it('should create session on submit when not updating', () => {

    mockRouter.url = '/sessions/create';
    component.ngOnInit();

    mockSessionApiService.create.mockReturnValue(of({}));

    component.submit();

    expect(mockSessionApiService.create).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Session created !',
      'Close',
      { duration: 3000 }
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should update session on submit when updating', () => {

    const mockSession = {
      name: 'Yoga',
      date: new Date().toISOString(),
      teacher_id: 2,
      description: 'Desc'
    };

    mockRouter.url = '/sessions/update/1';
    mockSessionApiService.detail.mockReturnValue(of(mockSession));
    mockSessionApiService.update.mockReturnValue(of({}));

    component.ngOnInit();
    component.submit();

    expect(mockSessionApiService.update).toHaveBeenCalledWith('1', expect.any(Object));
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Session updated !',
      'Close',
      { duration: 3000 }
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

});
