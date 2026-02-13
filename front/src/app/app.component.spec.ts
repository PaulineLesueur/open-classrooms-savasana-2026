import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { expect, jest } from '@jest/globals';

import { AppComponent } from './app.component';
import { SessionService } from './services/session.service';
import { AuthService } from './features/auth/services/auth.service';

describe('AppComponent', () => {

  const sessionServiceMock = {
    logOut: jest.fn(),
    $isLogged: jest.fn()
  };

  const routerMock = {
    navigate: jest.fn()
  };

  const authServiceMock = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatToolbarModule
      ],
      declarations: [AppComponent],
      providers: [
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock }
      ],
    }).compileComponents();

    jest.clearAllMocks();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should return observable from $isLogged()', (done) => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    sessionServiceMock.$isLogged.mockReturnValue(of(true));

    app.$isLogged().subscribe(value => {
      expect(value).toBe(true);
      expect(sessionServiceMock.$isLogged).toHaveBeenCalled();
      done();
    });
  });

  it('should call logOut and navigate on logout()', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.logout();

    expect(sessionServiceMock.logOut).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
  });
});
