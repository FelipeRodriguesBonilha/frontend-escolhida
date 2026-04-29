import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.getToken() || authService.isTokenExpired()) {
    authService.logout();
    router.navigate(['/login']);
    return false;
  }

  if (!authService.isAdmin()) {
    authService.logout();
    router.navigate(['/login']);
    return false;
  }

  return true;
};
