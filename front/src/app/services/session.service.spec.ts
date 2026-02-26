import { TestBed } from '@angular/core/testing';
import { expect, jest } from '@jest/globals';

import { SessionService } from './session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

describe('SessionService', () => {
  let service: SessionService;

  const mockSession: SessionInformation = {
    id: 1,
    admin: true,
    token: 'fake-token',
    type: 'user',
    username: 'john.doe',
    firstName: 'John',
    lastName: 'Doe'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
  });

  it('should emit false by default from $isLogged', (done) => {
    service.$isLogged().subscribe((value) => {
      expect(value).toBe(false);
      done();
    });
  });

  it('logIn() should set sessionInformation, isLogged true and emit', (done) => {
    service.$isLogged().subscribe((value) => {
      if (value) {
        expect(service.isLogged).toBe(true);
        expect(service.sessionInformation).toEqual(mockSession);
        done();
      }
    });

    service.logIn(mockSession);
  });

  it('logOut() should clear sessionInformation, set isLogged false and emit', (done) => {
    service.logIn(mockSession); 
    service.$isLogged().subscribe((value) => {
      if (!value) {
        expect(service.isLogged).toBe(false);
        expect(service.sessionInformation).toBeUndefined();
        done();
      }
    });

    service.logOut();
  });
});
