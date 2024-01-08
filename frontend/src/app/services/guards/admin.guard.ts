import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const adminGuard: CanActivateFn = (route, state) => {
  let userService = inject(UserService);
  let router = inject(Router);
  let currentUser = toObservable(userService.currentUserSignal);

  return currentUser.pipe(
    filter((currentUser) => currentUser !== undefined),
    map((currentUser) => {
      if (!currentUser) {
        router.navigate(['/login']);
        return false;
      }
      if (currentUser.role !== 'admin') {
        router.navigate(['/']);
        return false;
      }
      return true;
    }));
};
