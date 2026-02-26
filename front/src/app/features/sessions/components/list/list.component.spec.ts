import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { expect } from '@jest/globals';

import { ListComponent } from './list.component';
import { SessionService } from 'src/app/services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { Session } from '../../interfaces/session.interface';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;

  const mockSessions: Session[] = [
    {
      id: 1,
      name: 'Yoga Morning',
      date: new Date(),
      teacher_id: 1,
      description: 'Morning session',
      users: []
    }
  ];

  const mockSessionApiService = {
    all: jest.fn().mockReturnValue(of(mockSessions))
  };

  const mockSessionInformation: SessionInformation = {
    id: 1,
    admin: true,
    token: 'fake-token',
    type: 'Bearer',
    username: 'john',
    firstName: 'John',
    lastName: 'Doe'
  };

  const mockSessionService: {
    sessionInformation: SessionInformation | undefined;
  } = {
    sessionInformation: mockSessionInformation
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      declarations: [ListComponent],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call sessionApiService.all on component creation', () => {
    expect(mockSessionApiService.all).toHaveBeenCalled();
  });

  it('sessions$ should emit sessions', (done) => {
    component.sessions$.subscribe((sessions) => {
      expect(sessions).toEqual(mockSessions);
      done();
    });
  });

  it('should return user when sessionInformation exists', () => {
    expect(component.user).toEqual(mockSessionInformation);
  });

  it('should return undefined when sessionInformation is undefined', () => {
    mockSessionService.sessionInformation = undefined;
    expect(component.user).toBeUndefined();
  });
});
