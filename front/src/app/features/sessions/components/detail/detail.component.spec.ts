import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { expect, jest } from '@jest/globals';
import { DetailComponent } from './detail.component';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from '../../../../services/teacher.service';
import { SessionService } from '../../../../services/session.service';
import { Session } from '../../interfaces/session.interface';
import { Teacher } from '../../../../interfaces/teacher.interface';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let httpMock: HttpTestingController;
  let routerMock: any;
  let sessionService: SessionService;

  const mockActivatedRoute = {
    snapshot: { paramMap: { get: () => '1' } }
  };

  beforeEach(async () => {
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, MatSnackBarModule],
      declarations: [DetailComponent],
      providers: [
        SessionApiService,
        TeacherService,
        SessionService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: routerMock },
      ]
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionService.sessionInformation = {
      id: 1,
      admin: true,
      token: 'abc',
      type: 'user',
      username: 'user',
      firstName: 'John',
      lastName: 'Doe'
    };

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  // -------------------
  // Tests unitaires purs
  // -------------------
  it('should create component and initialize values', () => {
    expect(component).toBeTruthy();
    expect(component.sessionId).toBe('1');
    expect(component.isAdmin).toBe(true);
    expect(component.userId).toBe('1');
  });

  it('should call window.history.back() on back()', () => {
    const spy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    component.back();
    expect(spy).toHaveBeenCalled();
  });

  // -------------------
  // Tests d’intégration API
  // -------------------
  it('should fetch session and teacher on ngOnInit', fakeAsync(() => {
    const mockSession: Session = { id: 1, name: 'session', description: 'desc', date: new Date(), teacher_id: 2, users: [1] };
    const mockTeacher: Teacher = { id: 2, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() };

    component.ngOnInit();

    const reqSession = httpMock.expectOne('api/session/1');
    reqSession.flush(mockSession);

    const reqTeacher = httpMock.expectOne('api/teacher/2');
    reqTeacher.flush(mockTeacher);

    tick();

    expect(component.session).toEqual(mockSession);
    expect(component.teacher).toEqual(mockTeacher);
    expect(component.isParticipate).toBe(true);
  }));

  it('should participate in session and refresh', fakeAsync(() => {
    const mockSession: Session = { id: 1, name: 'session', description: 'desc', date: new Date(), teacher_id: 2, users: [1] };
    const mockTeacher: Teacher = { id: 2, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() };

    component.participate();

    const reqParticipate = httpMock.expectOne('api/session/1/participate/1');
    reqParticipate.flush({});

    const reqSession = httpMock.expectOne('api/session/1');
    reqSession.flush(mockSession);

    const reqTeacher = httpMock.expectOne('api/teacher/2');
    reqTeacher.flush(mockTeacher);

    tick();

    expect(component.isParticipate).toBe(true);
  }));

  it('should unParticipate in session and refresh', fakeAsync(() => {
    const mockSession: Session = { id: 1, name: 'session', description: 'desc', date: new Date(), teacher_id: 2, users: [] };
    const mockTeacher: Teacher = { id: 2, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() };

    component.unParticipate();

    const reqUnParticipate = httpMock.expectOne('api/session/1/participate/1');
    reqUnParticipate.flush({});

    const reqSession = httpMock.expectOne('api/session/1');
    reqSession.flush(mockSession);

    const reqTeacher = httpMock.expectOne('api/teacher/2');
    reqTeacher.flush(mockTeacher);

    tick();

    expect(component.isParticipate).toBe(false);
  }));

  it('should delete session and navigate', fakeAsync(() => {
    const snackBar = TestBed.inject(MatSnackBar);
    const snackSpy = jest.spyOn(snackBar, 'open').mockReturnValue({ afterDismissed: () => of() } as any);

    component.delete();

    const reqDelete = httpMock.expectOne('api/session/1');
    reqDelete.flush({});

    tick();

    expect(snackSpy).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
    expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
  }));
});
