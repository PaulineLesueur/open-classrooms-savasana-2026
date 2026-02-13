import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { expect, jest } from '@jest/globals';

import { MeComponent } from './me.component';
import { UserService } from '../../services/user.service';
import { SessionService } from '../../services/session.service';
import { User } from '../../interfaces/user.interface';
import { SessionInformation } from '../../interfaces/sessionInformation.interface';

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let snackBar: MatSnackBar;

  const mockRouter = { navigate: jest.fn() };
  const mockSessionInformation: SessionInformation = {
    id: 1,
    admin: true,
    token: 'fake-token',
    type: 'Bearer',
    username: 'john',
    firstName: 'John',
    lastName: 'Doe'
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
      declarations: [MeComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        SessionService,
        UserService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
    snackBar = TestBed.inject(MatSnackBar);

    sessionService.sessionInformation = mockSessionInformation;
    sessionService.isLogged = true;

    fixture.detectChanges();
  }));

  afterEach(() => {
    jest.clearAllMocks();
    httpMock.verify();
  });

  /** --- UNIT TESTS --- **/
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call window.history.back on back()', () => {
    const spy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    component.back();
    expect(spy).toHaveBeenCalled();
  });


  it('should fetch user on ngOnInit (integration)', () => {
    const mockUser: User = {
      id: 1,
      email: 'john@test.com',
      lastName: 'Doe',
      firstName: 'John',
      admin: false,
      password: '',
      createdAt: new Date()
    };

    component.ngOnInit();

    const req = httpMock.expectOne(`api/user/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);

    expect(component.user).toEqual(mockUser);
  });

  it('should delete account and logout user (integration)', () => {
    component.delete();

    const req = httpMock.expectOne(`api/user/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    expect(snackBar._openedSnackBarRef).toBeDefined();
    expect(sessionService.isLogged).toBe(false);
    expect(sessionService.sessionInformation).toBeUndefined();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

});
