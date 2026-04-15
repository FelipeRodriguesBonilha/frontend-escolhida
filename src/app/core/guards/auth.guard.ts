import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('authToken');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const userStr = localStorage.getItem('user');

  if (!userStr) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const user = JSON.parse(userStr);

    if (user.role !== 'ADMIN') {
      router.navigate(['/login']);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    router.navigate(['/login']);
    return false;
  }
};
