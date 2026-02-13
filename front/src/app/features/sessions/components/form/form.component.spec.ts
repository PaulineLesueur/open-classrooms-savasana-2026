import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormComponent } from './form.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from '../../../../services/teacher.service';
import { SessionService } from '../../../../services/session.service';
import { Session } from '../../interfaces/session.interface';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { expect, jest } from '@jest/globals';

class MockSessionApiService {
  create(session: Session) { return of(session); }
  update(id: string, session: Session) { return of(session); }
  detail(id: string) {
    return of({
      id: 1,
      name: 'Vinyasa Flow',
      date: new Date(),
      teacher_id: 1,
      description: 'Yoga session to stretch and strengthen muscles'
    } as Session);
  }
}

class MockTeacherService {
  all() { return of([{ id: 1, name: 'Alice Yoga' }]); }
}

class MockSessionService {
  sessionInformation = { admin: true } as any;
}

describe('FormComponent (Yoga Sessions)', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let routerMock: any;
  let routeMock: any;
  let snackBar: MatSnackBar;
  let sessionApi: SessionApiService;
  let sessionService: SessionService;

  beforeEach(async () => {
    routerMock = { navigate: jest.fn(), url: '/sessions/create' };
    routeMock = { snapshot: { paramMap: { get: jest.fn().mockReturnValue('123') } } };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatSnackBarModule, NoopAnimationsModule],
      declarations: [FormComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SessionApiService, useClass: MockSessionApiService },
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: SessionService, useClass: MockSessionService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    snackBar = TestBed.inject(MatSnackBar);
    sessionApi = TestBed.inject(SessionApiService);
    sessionService = TestBed.inject(SessionService);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create component and initialize form for new yoga session', () => {
    expect(component).toBeTruthy();
    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm).toBeDefined();
    expect(component.sessionForm?.controls['name'].value).toBe('');
  });

  it('should redirect non-admin user', () => {
    sessionService.sessionInformation!.admin = false;
    component.ngOnInit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  it('should initialize form for update yoga session', fakeAsync(() => {
    routerMock.url = '/sessions/update';
    const spyInit = jest.spyOn(component as any, 'initForm');
    component.ngOnInit();
    tick(); 
    expect(component.onUpdate).toBe(true);
    expect(routeMock.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(spyInit).toHaveBeenCalled();
  }));

  it('should submit new yoga session', fakeAsync(() => {
    const spyExit = jest.spyOn(component as any, 'exitPage').mockImplementation(() => {});
    component.onUpdate = false;
    component.sessionForm = component['fb'].group({
      name: ['Hatha Yoga'],
      date: ['2026-02-13'],
      teacher_id: [1],
      description: ['Gentle yoga to improve flexibility']
    });

    component.submit();
    tick();
    expect(spyExit).toHaveBeenCalledWith('Session created !');
  }));

  it('should submit update for existing yoga session', fakeAsync(() => {
    const spyExit = jest.spyOn(component as any, 'exitPage').mockImplementation(() => {});
    component.onUpdate = true;
    component['id'] = '123';
    component.sessionForm = component['fb'].group({
      name: ['Power Yoga'],
      date: ['2026-02-13'],
      teacher_id: [1],
      description: ['Intense yoga session for strength']
    });

    component.submit();
    tick(); 
    expect(spyExit).toHaveBeenCalledWith('Session updated !');
  }));

  it('should initialize form with given yoga session', () => {
    const testSession: Session = {
      id: 1,
      name: 'Yin Yoga',
      date: new Date(),
      teacher_id: 2,
      users: [1],
      description: 'Relaxing yoga for deep stretches'
    };
    component['initForm'](testSession);
    expect(component.sessionForm?.value.name).toBe('Yin Yoga');
    expect(component.sessionForm?.value.teacher_id).toBe(2);
  });

  it('should exit page and show snackbar', () => {
    const spySnack = jest.spyOn(snackBar, 'open').mockReturnValue({ afterDismissed: () => of() } as any);
    component['exitPage']('Yoga session saved!');
    expect(spySnack).toHaveBeenCalledWith('Yoga session saved!', 'Close', { duration: 3000 });
    expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
  });
});
