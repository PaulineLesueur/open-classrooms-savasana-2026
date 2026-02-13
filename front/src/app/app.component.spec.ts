import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect, jest } from '@jest/globals';

import { AppComponent } from './app.component';
import { SessionService } from './services/session.service';
import { AuthService } from './features/auth/services/auth.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, MatToolbarModule],
      declarations: [AppComponent],
      providers: [SessionService, AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);

    jest.clearAllMocks();
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should call logout() and navigate', () => {
    const spyRouter = jest.spyOn(router, 'navigate');
    component.logout();
    expect(sessionService.isLogged).toBe(false);
    expect(sessionService.sessionInformation).toBeUndefined();
    expect(spyRouter).toHaveBeenCalledWith(['']);
  });

  it('should return observable from $isLogged() (integration)', (done) => {
    sessionService.isLogged = true;
    sessionService.sessionInformation = { id: 1, admin: true, token: '', type: '', username: '', firstName: '', lastName: '' };

    component.$isLogged().subscribe(value => {
      expect(value).toBe(true);
      done();
    });
  });

  it('should reflect logout in $isLogged() observable (integration)', (done) => {
    sessionService.isLogged = true;
    sessionService.sessionInformation = { id: 1, admin: true, token: '', type: '', username: '', firstName: '', lastName: '' };

    component.logout();

    component.$isLogged().subscribe(value => {
      expect(value).toBe(false);
      done();
    });
  });
});
