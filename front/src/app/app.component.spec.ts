import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { expect, jest } from '@jest/globals';

import { AppComponent } from './app.component';
import { SessionService } from './services/session.service';
import { AuthService } from './features/auth/services/auth.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let sessionServiceMock: any; 
  let router: Router;
  let ngZone: NgZone;

  beforeEach(waitForAsync(() => {
    const isLoggedSubject = new BehaviorSubject<boolean>(true);

    sessionServiceMock = {
      isLogged: true,
      sessionInformation: { id: 1, admin: true, token: '', type: '', username: '', firstName: '', lastName: '' },
      logOut: jest.fn(() => {
        sessionServiceMock.isLogged = false;
        sessionServiceMock.sessionInformation = undefined;
        isLoggedSubject.next(false);
      }),
      $isLogged: jest.fn(() => isLoggedSubject.asObservable())
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, MatToolbarModule],
      declarations: [AppComponent],
      providers: [
        { provide: SessionService, useValue: sessionServiceMock },
        AuthService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    ngZone = TestBed.inject(NgZone);

    jest.clearAllMocks();
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should call logout() and navigate inside NgZone', () => {
    const spyRouter = jest.spyOn(router, 'navigate');
    ngZone.run(() => component.logout());
    expect(sessionServiceMock.isLogged).toBe(false);
    expect(sessionServiceMock.sessionInformation).toBeUndefined();
    expect(spyRouter).toHaveBeenCalledWith(['']);
  });

  it('should return observable from $isLogged() (integration)', (done) => {
    component.$isLogged().subscribe(value => {
      expect(value).toBe(true);
      done();
    });
  });

  it('should reflect logout in $isLogged() observable (integration)', (done) => {
    ngZone.run(() => component.logout());

    component.$isLogged().subscribe(value => {
      expect(value).toBe(false);
      done();
    });
  });
});
