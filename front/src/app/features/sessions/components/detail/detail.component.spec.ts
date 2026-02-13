import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { expect, jest } from '@jest/globals';

import { DetailComponent } from './detail.component';
import { SessionService } from '../../../../services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from '../../../../services/teacher.service';

describe('DetailComponent', () => {

  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jest.fn().mockReturnValue('1')
      }
    }
  };

  const mockSessionService = {
    sessionInformation: {
      admin: true,
      id: 1
    }
  };

  const mockSessionApiService = {
    detail: jest.fn().mockReturnValue(of({ teacher_id: 2, users: [1] })),
    delete: jest.fn().mockReturnValue(of({})),
    participate: jest.fn().mockReturnValue(of({})),
    unParticipate: jest.fn().mockReturnValue(of({}))
  };

  const mockTeacherService = {
    detail: jest.fn().mockReturnValue(of({ id: 2 }))
  };

  const mockSnackBar = { open: jest.fn() };
  const mockRouter = { navigate: jest.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, ReactiveFormsModule],
      declarations: [DetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => jest.clearAllMocks());

  it('should create and initialize constructor values', () => {
    expect(component).toBeTruthy();
    expect(component.sessionId).toBe('1');
    expect(component.isAdmin).toBe(true);
    expect(component.userId).toBe('1');
  });

  it('should call fetchSession on ngOnInit', () => {
    const spy = jest.spyOn<any, any>(component, 'fetchSession');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should call window.history.back on back()', () => {
    const spy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    component.back();
    expect(spy).toHaveBeenCalled();
  });

  it('should delete session, show snackbar and navigate', () => {
    component.delete();
    expect(mockSessionApiService.delete).toHaveBeenCalledWith('1');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Session deleted !',
      'Close',
      { duration: 3000 }
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should participate and refresh session', () => {
    const spy = jest.spyOn<any, any>(component, 'fetchSession');
    component.participate();
    expect(mockSessionApiService.participate).toHaveBeenCalledWith('1', '1');
    expect(spy).toHaveBeenCalled();
  });

  it('should unParticipate and refresh session', () => {
    const spy = jest.spyOn<any, any>(component, 'fetchSession');
    component.unParticipate();
    expect(mockSessionApiService.unParticipate).toHaveBeenCalledWith('1', '1');
    expect(spy).toHaveBeenCalled();
  });

  it('should fetch session and set isParticipate TRUE', () => {
    const session = { teacher_id: 2, users: [1, 3] };
    const teacher = { id: 2 };
    mockSessionApiService.detail.mockReturnValue(of(session));
    mockTeacherService.detail.mockReturnValue(of(teacher));

    component['fetchSession']();

    expect(mockSessionApiService.detail).toHaveBeenCalledWith('1');
    expect(component.session).toEqual(session);
    expect(component.isParticipate).toBe(true);
    expect(mockTeacherService.detail).toHaveBeenCalledWith('2');
    expect(component.teacher).toEqual(teacher);
  });

  it('should fetch session and set isParticipate FALSE', () => {
    const session = { teacher_id: 2, users: [3, 4] };
    const teacher = { id: 2 };
    mockSessionApiService.detail.mockReturnValue(of(session));
    mockTeacherService.detail.mockReturnValue(of(teacher));

    component['fetchSession']();

    expect(component.isParticipate).toBe(false);
  });
});
