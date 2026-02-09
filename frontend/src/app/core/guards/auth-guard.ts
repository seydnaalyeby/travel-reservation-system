import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth';
import { map, catchError, of } from 'rxjs';

// Helper function to check if JWT token is expired
function isTokenExpired(token: string): boolean {
  try {
    console.log('Checking token:', token.substring(0, 20) + '...');
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp;
    const isExpired = exp < now;
    console.log('Token details:', {
      exp: exp,
      now: now,
      isExpired: isExpired,
      timeLeft: exp - now,
      timeLeftMinutes: Math.floor((exp - now) / 60)
    });
    return isExpired;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return true; // If we can't parse, assume it's expired
  }
}

export const authGuard: CanActivateFn = () => {
  const storage = inject(TokenStorageService);
  const router = inject(Router);
  const auth = inject(AuthService);

  const access = storage.getAccessToken();
  const refresh = storage.getRefreshToken();
  
  console.log('=== AUTH GUARD CHECK ===');
  console.log('Has access token:', !!access);
  console.log('Has refresh token:', !!refresh);
  console.log('Access token length:', access?.length || 0);
  console.log('Refresh token length:', refresh?.length || 0);

  // If we have a refresh token but no access token, try to refresh
  if (!access && refresh) {
    console.log('🔄 No access token, attempting refresh...');
    return auth.refresh().pipe(
      map((res) => {
        console.log('✅ Refresh successful:', res);
        // Tokens are already saved by the refresh method
        if (res.accessToken) {
          return true;
        }
        // If refresh didn't return a token, logout and redirect
        auth.logout();
        router.navigateByUrl('/login');
        return false;
      }),
      catchError((error) => {
        console.error('❌ Refresh failed:', error);
        // Refresh failed, logout and redirect to login
        auth.logout();
        router.navigateByUrl('/login');
        return of(false);
      })
    );
  }

  // If we have an access token, check if it's expired
  if (access) {
    if (!isTokenExpired(access)) {
      console.log('✅ Access token is valid');
      return true; // Token is valid, allow access
    }
    
    console.log('⏰ Access token expired, attempting refresh...');
    // Token is expired, try to refresh if we have refresh token
    if (refresh) {
      return auth.refresh().pipe(
        map((res) => {
          console.log('✅ Expired token refresh successful:', res);
          if (res.accessToken) {
            return true;
          }
          auth.logout();
          router.navigateByUrl('/login');
          return false;
        }),
        catchError((error) => {
          console.error('❌ Expired token refresh failed:', error);
          auth.logout();
          router.navigateByUrl('/login');
          return of(false);
        })
      );
    }
  }

  // No valid tokens, redirect to login
  console.log('🚪 No valid tokens, redirecting to login');
  auth.logout();
  router.navigateByUrl('/login');
  return false;
};
