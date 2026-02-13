import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { expect, jest } from '@jest/globals';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { SessionService } from 'src/app/services/session.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const authServiceMock = {
    login: jest.fn()
  };

  const sessionServiceMock = {
    logIn: jest.fn()
  };

  const routerMock = {
    navigate: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Reset mocks before each test
    authServiceMock.login.mockReset();
    sessionServiceMock.logIn.mockReset();
    routerMock.navigate.mockReset();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should submit login successfully', () => {
    const mockResponse = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      admin: false,
      token: 'jwt-token',
      type: 'Bearer',
      username: 'test@example.com'
    };

    authServiceMock.login.mockReturnValue(of(mockResponse));

    component.form.setValue({ email: 'test@example.com', password: '123456' });
    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledWith({ email: 'test@example.com', password: '123456' });
    expect(sessionServiceMock.logIn).toHaveBeenCalledWith(mockResponse);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
    expect(component.onError).toBe(false);
  });

  it('should set onError to true if login fails', () => {
    authServiceMock.login.mockReturnValue(throwError(() => new Error('Invalid credentials')));

    component.form.setValue({ email: 'wrong@example.com', password: '123' });
    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledWith({ email: 'wrong@example.com', password: '123' });
    expect(component.onError).toBe(true);
    expect(sessionServiceMock.logIn).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
