import { Injectable, signal } from '@angular/core';
import { User } from '../interfaces/user';
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

  constructor(private httpClient : HttpClient ) {}

  public login(username: string, password: string) : Observable<{user: User, session: Session}> {
    const loginUrl = this.baseUrl + 'login';
    const user = { username, password };
    
    console.log(user);

    return this.httpClient.post(loginUrl, user).pipe(
      map((response: any) => {
        const user: User = {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          fullName: response.user.full_name,
          role: response.user.role,
          paswordChangedAt: response.user.password_changed_at,
          createdAt: response.user.created_at,
          updatedAt: response.user.updated_at,
        };
        const session: Session = {
          accessToken: response.access_token,
          accessTokenExpiresAt: response.access_token_expires_at,
          refreshToken: response.refresh_token,
          refreshTokenExpiresAt: response.refresh_token_expires_at,
          sessionID: response.session_id,
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
        const user: User = {
          id: response.id,
          username: response.username,
          email: response.email,
          fullName: response.full_name,
          role: response.role,
          paswordChangedAt: response.password_changed_at,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
        };
        return user;
      }));
  } 

  public getCurrentUser() : Observable<User>{
    const getUserUrl = this.baseUrl + 'users/me';
    
    return this.httpClient.get(getUserUrl).pipe(
      map((response: any) => {
        const user: User = {
          id: response.id,
          username: response.username,
          email: response.email,
          fullName: response.full_name,
          role: response.role,
          paswordChangedAt: response.password_changed_at,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
        };
        return user;
      }));
  }

  public logout() : void {
    localStorage.setItem('access_token', '');
    this.currentUserSignal.set(null);
  }
}
