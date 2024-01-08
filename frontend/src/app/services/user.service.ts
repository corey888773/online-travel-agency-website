import { Injectable, signal } from '@angular/core';
import { User } from '../users/user';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Session } from '../interfaces/session';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl = 'http://localhost:8000/';
  currentUserSignal = signal<User | undefined | null> (undefined);
  sessionSignal = signal<Session | undefined | null> (undefined);

  constructor(private httpClient : HttpClient ) {}

  public login(username: string, password: string) : Observable<{user: User, session: Session}> {
    const loginUrl = this.baseUrl + 'login';
    const user = { username, password };

    return this.httpClient.post(loginUrl, user).pipe(
      map((response: any) => {
        const user: User = response.user;
        const session: Session = {
          accessToken: response.accessToken,
          accessTokenExpiresAt: response.accessTokenExpiresAt,
          refreshToken: response.refreshToken,
          refreshTokenExpiresAt: response.refreshTokenExpiresAt,
          sessionID: response.sessionID,
        };

        return {
          session,
          user,
        };
      }));
  }

  public register(username: string, password: string, email: string, fullName: string) : Observable<User> {
    const registerUrl = this.baseUrl + 'register';
    const user = { username, password, email, fullName };

    return this.httpClient.post(registerUrl, user).pipe(
      map((response: any) => {
        const user: User = response
        return user;
      }));
  } 

  public getCurrentUser() : Observable<User>{
    const getUserUrl = this.baseUrl + 'users/me';
    
    return this.httpClient.get(getUserUrl).pipe(
      map((response: any) => {
        const user: User = response
        return user;
      }));
  }

  public logout() : void {
    localStorage.setItem('access_token', '');
    localStorage.setItem('refresh_token', '');
    localStorage.setItem('session_id', '');
    this.currentUserSignal.set(null);
  }

  public renewAccessToken(sessionID : string, refreshToken : string) : Observable<{
    accessToken: string,
    accessTokenExpiresAt: Date,
  }> {
    const renewTokenUrl = this.baseUrl + 'renewAccess';

    return this.httpClient.post(renewTokenUrl, {
      refreshToken: refreshToken,
      sessionID: sessionID,
    }).pipe(
      map((response: any) => {
        return {
          accessToken: response.accessToken,
          accessTokenExpiresAt: response.accessTokenExpiresAt,
        };
      }));
  }
}
