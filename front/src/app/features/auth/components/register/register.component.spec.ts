import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { expect, jest } from '@jest/globals';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  const authServiceMock = {
    register: jest.fn()
  };
  const routerMock = {
    navigate: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    authServiceMock.register.mockReset();
    routerMock.navigate.mockReset();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should submit successfully and navigate to login', () => {
    authServiceMock.register.mockReturnValue(of(void 0));

    component.form.setValue({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });

    component.submit();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.onError).toBe(false);
  });

  it('should set onError to true if registration fails', () => {
    authServiceMock.register.mockReturnValue(throwError(() => new Error('Failed')));

    component.form.setValue({
      email: 'fail@example.com',
      firstName: 'Fail',
      lastName: 'User',
      password: 'badpass'
    });

    component.submit();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      email: 'fail@example.com',
      firstName: 'Fail',
      lastName: 'User',
      password: 'badpass'
    });
    expect(component.onError).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
