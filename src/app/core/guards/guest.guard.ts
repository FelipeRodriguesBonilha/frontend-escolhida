import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth';

export const GuestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.getToken() && !authService.isTokenExpired() && authService.isAdmin()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
