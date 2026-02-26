import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoginRequest } from '../interfaces/loginRequest.interface';
import { RegisterRequest } from '../interfaces/registerRequest.interface';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { expect, jest } from '@jest/globals';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call register endpoint', () => {
    const mockRequest: RegisterRequest = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'pass123'
    };

    service.register(mockRequest).subscribe(response => {
      expect(response).toBeUndefined(); 
    });

    const req = httpMock.expectOne('api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);

    req.flush(null);
  });

  it('should call login endpoint', () => {
    const mockRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'pass123'
    };

    const mockResponse: SessionInformation = {
      id: 1,
      token: 'fake-jwt-token',
      type: 'USER',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      admin: false
    };

    service.login(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);

    req.flush(mockResponse);
  });
});
