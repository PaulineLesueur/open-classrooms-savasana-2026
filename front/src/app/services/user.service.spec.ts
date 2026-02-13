import { TestBed } from '@angular/core/testing';
import { expect, jest } from '@jest/globals';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';

describe('UserService', () => {
  let service: UserService;
  let httpClientMock: Partial<HttpClient>;

  const mockUser: User = {
    id: 1,
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn() as any,
      delete: jest.fn() as any
    };

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: HttpClient, useValue: httpClientMock }
      ]
    });

    service = TestBed.inject(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getById() should call HttpClient.get with id and return user', (done) => {
    (httpClientMock.get as jest.Mock).mockReturnValue(of(mockUser));

    service.getById('1').subscribe((user) => {
      expect(user).toEqual(mockUser);
      expect(httpClientMock.get).toHaveBeenCalledWith('api/user/1');
      done();
    });
  });

  it('delete() should call HttpClient.delete with id', (done) => {
    (httpClientMock.delete as jest.Mock).mockReturnValue(of({}));

    service.delete('1').subscribe((response) => {
      expect(response).toEqual({});
      expect(httpClientMock.delete).toHaveBeenCalledWith('api/user/1');
      done();
    });
  });
});
