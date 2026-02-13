import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { expect, jest } from '@jest/globals';
import { MeComponent } from './me.component';
import { UserService } from '../../services/user.service';
import { SessionService } from '../../services/session.service';
import { User } from '../../interfaces/user.interface';
import { SessionInformation } from '../../interfaces/sessionInformation.interface';

// ----- Mock services -----
class MockUserService {
  getById(id: string) {
    return of({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      admin: false,
      password: '',
      createdAt: new Date()
    });
  }

  delete(id: string) {
    return of({});
  }
}

class MockSessionService {
  sessionInformation: SessionInformation = {
    id: 1,
    admin: true,
    token: 'token',
    type: 'Bearer',
    username: 'john',
    firstName: 'John',
    lastName: 'Doe'
  };
  isLogged = true;

  logOut() {
    this.isLogged = false;
  }
}

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let userService: UserService;
  let sessionService: SessionService;
  let snackBar: MatSnackBar;
  let routerMock: any;

  beforeEach(async () => {
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        NoopAnimationsModule
      ],
      declarations: [MeComponent],
      providers: [
        { provide: UserService, useClass: MockUserService },
        { provide: SessionService, useClass: MockSessionService },
        { provide: Router, useValue: routerMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;

    userService = TestBed.inject(UserService);
    sessionService = TestBed.inject(SessionService);
    snackBar = TestBed.inject(MatSnackBar);

    fixture.detectChanges(); // ngOnInit est appelé ici
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
    // on supprime la vérification sur user ici car ngOnInit l'initialise immédiatement
  });

  it('should call window.history.back() on back()', () => {
    const spy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    component.back();
    expect(spy).toHaveBeenCalled();
  });

  it('should fetch user on ngOnInit', fakeAsync(() => {
    const spyGet = jest.spyOn(userService, 'getById');
    component.ngOnInit();
    tick();

    expect(spyGet).toHaveBeenCalledWith(sessionService.sessionInformation!.id.toString());
    expect(component.user).toBeDefined();
    expect(component.user?.firstName).toBe('John');
  }));

  it('should delete account, show snackbar, logout and navigate', fakeAsync(() => {
    const spyDelete = jest.spyOn(userService, 'delete');
    const spySnack = jest.spyOn(snackBar, 'open').mockReturnValue({ afterDismissed: () => of() } as any);
    const spyLogout = jest.spyOn(sessionService, 'logOut');

    component.delete();
    tick();

    expect(spyDelete).toHaveBeenCalledWith(sessionService.sessionInformation!.id.toString());
    expect(spySnack).toHaveBeenCalledWith('Your account has been deleted !', 'Close', { duration: 3000 });
    expect(spyLogout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  }));
});
