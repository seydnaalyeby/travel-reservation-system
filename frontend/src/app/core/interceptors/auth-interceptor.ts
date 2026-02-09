import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth';
import { catchError, filter, switchMap, take, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Skip adding token to refresh endpoint itself
  const isRefreshCall =
    req.url.includes('/api/auth/refresh') || req.url.includes('/auth/refresh');

  // Add authorization header if token exists and this is not a refresh call
  const token = auth.getAccessToken();
  
  console.log('🌐 INTERCEPTOR DEBUG');
  console.log('Request URL:', req.url);
  console.log('Is refresh call:', isRefreshCall);
  console.log('Has token:', !!token);
  console.log('Token length:', token?.length || 0);
  
  const authReq =
    token && !isRefreshCall
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  if (token && !isRefreshCall) {
    console.log('✅ Adding Authorization header:', `Bearer ${token.substring(0, 20)}...`);
  } else if (!token) {
    console.log('❌ No token available for request');
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('🚨 HTTP Error:', {
        status: error.status,
        url: error.url,
        message: error.message
      });
      
      // If error is not 401/403 or this is a refresh call, just throw the error
      if ((error.status !== 401 && error.status !== 403) || isRefreshCall) {
        console.log('❌ Not a token refresh error, throwing error');
        return throwError(() => error);
      }

      // Try to refresh the token
      const refreshToken = auth.getRefreshToken();
      if (!refreshToken) {
        console.log('❌ No refresh token available, logging out');
        // No refresh token available, logout and redirect to login
        auth.logout();
        router.navigateByUrl('/login');
        return throwError(() => error);
      }

      // If already refreshing, queue the request
      if (auth.isRefreshing) {
        console.log('⏳ Refresh already in progress, queuing request');
        return auth.getRefreshTokenSubject().pipe(
          filter((token) => token !== null),
          take(1),
          switchMap((newToken) => {
            console.log('🔄 Retrying queued request with new token');
            const retryReq = authReq.clone({
              setHeaders: { Authorization: `Bearer ${newToken as string}` },
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            console.error('❌ Queued request failed after refresh:', refreshErr);
            auth.logout();
            router.navigateByUrl('/login');
            return throwError(() => refreshErr);
          })
        );
      }

      // Start the refresh process
      console.log('🔄 Starting token refresh process');
      auth.isRefreshing = true;
      auth.updateRefreshTokenSubject(null);

      return auth.refresh().pipe(
        switchMap((res) => {
          console.log('✅ Refresh successful, updating subject');
          auth.isRefreshing = false;
          
          // Notify all waiting requests with the new token
          auth.updateRefreshTokenSubject(res.accessToken);
          
          // Retry the original request with the new token
          const retryReq = authReq.clone({
            setHeaders: { Authorization: `Bearer ${res.accessToken}` },
          });
          console.log('🔄 Retrying original request with new token');
          return next(retryReq);
        }),
        catchError((refreshErr) => {
          console.error('❌ Refresh failed:', refreshErr);
          // Refresh failed, logout and redirect to login
          auth.isRefreshing = false;
          auth.updateRefreshTokenSubject(null);
          auth.logout();
          router.navigateByUrl('/login');
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
