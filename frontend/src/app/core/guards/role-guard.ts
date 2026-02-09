import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage';
import { Router } from '@angular/router';
import { Role } from '../auth/auth.models';

export const roleGuard: CanActivateFn = (route) => {
  const storage = inject(TokenStorageService);
  const router = inject(Router);

  const expectedRole = route.data?.['role'] as Role | undefined;
  const role = storage.getRole();

  if (!role) {
    router.navigateByUrl('/login');
    return false;
  }

  // ✅ ADMIN passe partout
  if (role === 'ADMIN') return true;

  // Sinon: respecter le rôle demandé
  if (expectedRole && role !== expectedRole) {
    router.navigateByUrl('/client'); // ou page not-authorized
    return false;
  }
  return true;
};
