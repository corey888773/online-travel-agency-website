import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accessToken = localStorage?.getItem('access_token') ?? '';
  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  }); 
  
  return next(req);
};
 