import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, tap } from 'rxjs';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
    let service = inject(UserService);
    req = req.clone();
    let url = req.url;

    if (url.includes("renewAccess")){
      return next(req);
    }

    let accessToken: string|null = localStorage.getItem("access_token");
    let accessTokenExpiresAt: string|null = localStorage.getItem("access_token_expires_at");

    if(accessToken && accessTokenExpiresAt){
        let expiresAtDate = new Date(accessTokenExpiresAt!);

        console.log("expires at date: " + expiresAtDate);
        if(expiresAtDate < new Date(new Date().getTime() - 5000)){
            service.renewAccessToken()
            .pipe(
              tap((data: any) => {
                let token = data.accessToken;
                let expiresAt = data.accessTokenExpiresAt;                
                localStorage.setItem("access_token", token);
                localStorage.setItem("access_token_expires_at", expiresAt.toString());
              })
              )
            .subscribe(() => {
                return next(req);
            });
        }

        return next(req);
    }

    return next(req);
};

