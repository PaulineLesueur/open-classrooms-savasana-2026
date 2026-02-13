import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { expect, jest } from '@jest/globals';

import { FormComponent } from './form.component';
import { SessionService } from '../../../../services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from '../../../../services/teacher.service';
import { Session } from '../../interfaces/session.interface';

describe('FormComponent', () => {

  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let snackBar: MatSnackBar;

  const mockRouter = { navigate: jest.fn(), url: '' };
  const mockActivatedRoute = { snapshot: { paramMap: { get: jest.fn().mockReturnValue('1') } } };

  const mockSessionInfo = { admin: true, id: 1, token: '', username: 'user', firstName: 'First', lastName: 'Last', type: 'admin' };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, MatSnackBarModule],
      declarations: [FormComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        SessionService,
        SessionApiService,
        TeacherService,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
    snackBar = TestBed.inject(MatSnackBar);

    sessionService.sessionInformation = mockSessionInfo;
    sessionService.isLogged = true;

    fixture.detectChanges();
  }));

  afterEach(() => {
    jest.clearAllMocks();
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect if not admin', () => {
    sessionService.sessionInformation!.admin = false;
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  it('should init form in create mode', () => {
    mockRouter.url = '/sessions/create';
    component.ngOnInit();
    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm).toBeDefined();
  });

  it('should fetch session in update mode (integration)', () => {
    const mockSession: Session = { id: 1, name: 'Yoga', date: new Date(), teacher_id: 2, description: 'Desc', users: [] };
    mockRouter.url = '/sessions/update/1';

    component.ngOnInit();

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockSession);

    expect(component.sessionForm?.value.name).toBe('Yoga');
    expect(component.onUpdate).toBe(true);
  });

  it('should create session via submit (integration)', () => {
    mockRouter.url = '/sessions/create';
    component.ngOnInit();

    component.sessionForm?.setValue({ name: 'Yoga', date: new Date().toISOString().split('T')[0], teacher_id: 1, description: 'Desc' });
    component.submit();

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    req.flush({}); 

    expect(snackBar._openedSnackBarRef).toBeDefined();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should update session via submit (integration)', () => {
    const mockSession: Session = { id: 1, name: 'Yoga', date: new Date(), teacher_id: 2, description: 'Desc', users: [] };
    mockRouter.url = '/sessions/update/1';

    component.ngOnInit();
    const detailReq = httpMock.expectOne('api/session/1');
    detailReq.flush(mockSession);

    component.sessionForm?.patchValue({ name: 'Updated Yoga' });
    component.submit();

    const updateReq = httpMock.expectOne('api/session/1');
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush({}); 

    expect(snackBar._openedSnackBarRef).toBeDefined();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

});
