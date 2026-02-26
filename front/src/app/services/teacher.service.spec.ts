import { TestBed } from '@angular/core/testing';
import { expect, jest } from '@jest/globals';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { TeacherService } from './teacher.service';
import { Teacher } from '../interfaces/teacher.interface';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpClientMock: Partial<HttpClient>; 

  const mockTeachers: Teacher[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, firstName: 'Jane', lastName: 'Smith', createdAt: new Date(), updatedAt: new Date() }
  ];

  const mockTeacher: Teacher = { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() };

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn() as any
    };

    TestBed.configureTestingModule({
      providers: [
        TeacherService,
        { provide: HttpClient, useValue: httpClientMock }
      ]
    });

    service = TestBed.inject(TeacherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('all() should call HttpClient.get and return teachers', (done) => {
    (httpClientMock.get as jest.Mock).mockReturnValue(of(mockTeachers));

    service.all().subscribe((teachers) => {
      expect(teachers).toEqual(mockTeachers);
      expect(httpClientMock.get).toHaveBeenCalledWith('api/teacher');
      done();
    });
  });

  it('detail() should call HttpClient.get with id and return teacher', (done) => {
    (httpClientMock.get as jest.Mock).mockReturnValue(of(mockTeacher));

    service.detail('1').subscribe((teacher) => {
      expect(teacher).toEqual(mockTeacher);
      expect(httpClientMock.get).toHaveBeenCalledWith('api/teacher/1');
      done();
    });
  });
});
