import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let userService : UserService = inject(UserService);
  const accessTokenExpiresAt = localStorage?.getItem('access_token_expires_at') ?? '';
  const refreshTokenExpiresAt = localStorage?.getItem('refresh_token_expires_at') ?? '';
  const sessionID = localStorage?.getItem('session_id') ?? '';
  const refreshToken = localStorage?.getItem('refresh_token') ?? '';

  if (accessTokenExpiresAt && refreshTokenExpiresAt && sessionID && refreshToken) {
    const accessTokenExpiresAtDate = new Date(accessTokenExpiresAt);
    const refreshTokenExpiresAtDate = new Date(refreshTokenExpiresAt);
    const now = new Date();

    if (accessTokenExpiresAtDate < now && refreshTokenExpiresAtDate > now) {
      userService.renewAccessToken(sessionID!, refreshToken!).subscribe({
        next: (response) => {
          localStorage.setItem('access_token', response.accessToken!);
  
          userService.getCurrentUser().subscribe({
            next: (user) => {
              userService.currentUserSignal.set(user);
            },
            error: () => {
              userService.currentUserSignal.set(null);
              return;
            }
          });
        },
        error: () => {
          userService.currentUserSignal.set(null);
          return;
        }
      });

    } else if (accessTokenExpiresAtDate < now && refreshTokenExpiresAtDate < now) {
      localStorage.setItem('access_token', '');
      localStorage.setItem('access_token_expires_at', '');
      localStorage.setItem('refresh_token', '');
      localStorage.setItem('refresh_token_expires_at', '');
      localStorage.setItem('session_id', '');
    }
  }

  const accessToken = localStorage?.getItem('access_token') ?? '';
  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  }); 
  
  return next(req);
};
 