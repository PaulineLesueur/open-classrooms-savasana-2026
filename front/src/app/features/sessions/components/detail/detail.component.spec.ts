import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { expect, jest } from '@jest/globals';
import { DetailComponent } from './detail.component';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from '../../../../services/teacher.service';
import { SessionService } from '../../../../services/session.service';

describe('DetailComponent Integration', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let routerMock: any;

  const mockActivatedRoute = {
    snapshot: { paramMap: { get: () => '1' } }
  };

  beforeEach(async () => {
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        MatSnackBarModule
      ],
      declarations: [DetailComponent],
      providers: [
        SessionApiService,
        TeacherService,
        SessionService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);

    // Initialiser une session pour l'intégration
    sessionService.sessionInformation = { id: 1, admin: true, token: 'abc', type: 'user', username: 'user', firstName: 'John', lastName: 'Doe' };
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie que toutes les requêtes HTTP ont été traitées
  });

  it('should create and initialize values', () => {
    expect(component).toBeTruthy();
    expect(component.sessionId).toBe('1');
    expect(component.isAdmin).toBe(true);
    expect(component.userId).toBe('1');
  });

  it('should fetch session and teacher correctly (integration)', () => {
    component.ngOnInit();

    // Intercepter la requête session
    const reqSession = httpMock.expectOne('api/session/1');
    reqSession.flush({ teacher_id: 2, users: [1, 3] });

    // Intercepter la requête teacher
    const reqTeacher = httpMock.expectOne('api/teacher/2');
    reqTeacher.flush({ id: 2, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() });

    expect(component.session).toBeDefined();
    expect(component.isParticipate).toBe(true);
    expect(component.teacher).toBeDefined();
  });

  it('should participate and refresh session (integration)', () => {
    component.participate();

    const reqParticipate = httpMock.expectOne('api/session/1/participate/1');
    reqParticipate.flush({}); // réponse vide

    const reqSession = httpMock.expectOne('api/session/1');
    reqSession.flush({ teacher_id: 2, users: [1] }); // session mise à jour

    const reqTeacher = httpMock.expectOne('api/teacher/2');
    reqTeacher.flush({ id: 2, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() });

    expect(component.session).toBeDefined();
    expect(component.isParticipate).toBe(true);
  });

  it('should unParticipate and refresh session (integration)', () => {
    component.unParticipate();

    const reqUnParticipate = httpMock.expectOne('api/session/1/participate/1');
    reqUnParticipate.flush({}); // réponse vide

    const reqSession = httpMock.expectOne('api/session/1');
    reqSession.flush({ teacher_id: 2, users: [] }); // plus de participation

    const reqTeacher = httpMock.expectOne('api/teacher/2');
    reqTeacher.flush({ id: 2, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() });

    expect(component.isParticipate).toBe(false);
  });

  it('should delete session and navigate (integration)', () => {
    component.delete();

    const reqDelete = httpMock.expectOne('api/session/1');
    reqDelete.flush({}); // suppression réussie

    expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should call window.history.back on back()', () => {
    const spy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    component.back();
    expect(spy).toHaveBeenCalled();
  });
});
