import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  public isLogged = false;
  public sessionInformation: SessionInformation | undefined;

  private isLoggedSubject = new BehaviorSubject<boolean>(this.isLogged);

  constructor() {
    // restore from localStorage if available (helps e2e tests and real app)
    const data = localStorage.getItem('sessionInformation');
    if (data) {
      try {
        this.sessionInformation = JSON.parse(data) as SessionInformation;
        this.isLogged = true;
      } catch {
        // ignore parse errors
      }
    }
    this.next();
  }

  public $isLogged(): Observable<boolean> {
    return this.isLoggedSubject.asObservable();
  }

  public logIn(user: SessionInformation): void {
    this.sessionInformation = user;
    this.isLogged = true;
    localStorage.setItem('sessionInformation', JSON.stringify(user));
    this.next();
  }

  public logOut(): void {
    this.sessionInformation = undefined;
    this.isLogged = false;
    localStorage.removeItem('sessionInformation');
    this.next();
  }

  private next(): void {
    this.isLoggedSubject.next(this.isLogged);
  }
}
