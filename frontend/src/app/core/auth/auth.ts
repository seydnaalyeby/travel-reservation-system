import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, RefreshTokenRequest } from './auth.models';
import { TokenStorageService } from './token-storage';
import { Observable, tap, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  
  // Refresh token queue management
  isRefreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private storage: TokenStorageService,
    private router: Router
  ) {}

  login(payload: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 LOGIN ATTEMPT');
    console.log('Login payload:', payload);
    console.log('Login URL:', `${this.baseUrl}/api/auth/login`);
    
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, payload).pipe(
      tap((res: AuthResponse) => {
        console.log('✅ Login response:', res);
        // Use accessToken field from backend response
        if (res.accessToken) {
          console.log('💾 Saving tokens...');
          console.log('Access token length:', res.accessToken.length);
          console.log('Refresh token length:', res.refreshToken?.length || 0);
          this.storage.setTokens(res.accessToken, res.refreshToken);
          console.log('✅ Tokens saved to localStorage');
        }

        if (res.role && res.userId && res.fullName && res.email) {
          console.log('👤 Saving user session...');
          // Store user session data
          this.storage.setSession(res.role, {
            userId: res.userId,
            fullName: res.fullName,
            email: res.email,
          });
          console.log('✅ User session saved');
        }
      }),
      catchError((error: any) => {
        console.error('❌ Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/register`, payload).pipe(
      tap((res: AuthResponse) => {
        // Use accessToken field from backend response
        if (res.accessToken) {
          this.storage.setTokens(res.accessToken, res.refreshToken);
        }

        if (res.role && res.userId && res.fullName && res.email) {
          // Store user session data
          this.storage.setSession(res.role, {
            userId: res.userId,
            fullName: res.fullName,
            email: res.email,
          });
        }
      })
    );
  }

  logout() {
    const refreshToken = this.getRefreshToken();
    
    // Call backend logout endpoint if refresh token exists
    if (refreshToken) {
      console.log('🚪 Logging out with refresh token...');
      this.http.post(`${this.baseUrl}/api/auth/logout`, { refreshToken } as RefreshTokenRequest).subscribe({
        next: () => {
          console.log('✅ Backend logout successful');
          // Logout successful, clear local storage
          this.storage.clear();
          this.router.navigateByUrl('/login');
        },
        error: (error) => {
          console.error('❌ Backend logout failed:', error);
          // Even if logout fails on backend, clear local storage
          this.storage.clear();
          this.router.navigateByUrl('/login');
        }
      });
    } else {
      console.log('🚪 No refresh token, clearing local storage only');
      // No refresh token, just clear local storage
      this.storage.clear();
      this.router.navigateByUrl('/login');
    }
  }

  isAuthenticated(): boolean {
    // ✅ getToken removed => use getAccessToken
    return !!this.storage.getAccessToken();
  }

  getAccessToken(): string | null {
    return this.storage.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.storage.getRefreshToken();
  }

  setTokens(accessToken: string, refreshToken?: string) {
    this.storage.setTokens(accessToken, refreshToken);
  }

  // Check if token is close to expiration (within 30 seconds)
  isTokenExpiringSoon(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = payload.exp - now;
      return timeLeft <= 30; // 30 seconds buffer
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // If we can't parse, assume it's expiring
    }
  }

  refresh(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    console.log('🔄 REFRESH ATTEMPT');
    console.log('Has refresh token:', !!refreshToken);
    console.log('Refresh token length:', refreshToken?.length || 0);
    console.log('Refresh URL:', `${this.baseUrl}/api/auth/refresh`);
    
    if (!refreshToken) {
      console.error('❌ No refresh token available');
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${this.baseUrl}/api/auth/refresh`,
      { refreshToken } as RefreshTokenRequest
    ).pipe(
      tap((res) => {
        console.log('✅ Refresh response:', res);
        // Save new tokens
        this.setTokens(res.accessToken, res.refreshToken);
        console.log('💾 Tokens saved successfully');
      }),
      catchError((error: any) => {
        console.error('❌ Refresh HTTP error:', error);
        return throwError(() => error);
      })
    );
  }

  // Proactive refresh before expiration
  refreshTokenIfNeeded(): Observable<string | null> {
    const currentToken = this.getAccessToken();
    
    if (!currentToken) {
      return of(null);
    }

    if (this.isTokenExpiringSoon(currentToken)) {
      console.log('⏰ Token expiring soon, proactively refreshing...');
      return this.refresh().pipe(
        map(res => res.accessToken),
        catchError(() => {
          console.error('❌ Proactive refresh failed');
          this.logout();
          return of(null);
        })
      );
    }

    return of(currentToken);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/api/auth/forgot-password`,
      { email }
    );
  }

  resetPassword(data: { token: string; newPassword: string; confirmPassword?: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/api/auth/reset-password`,
      data
    );
  }

  // Expose refreshSubject for interceptor
  getRefreshTokenSubject() {
    return this.refreshSubject.asObservable();
  }

  // Allow interceptor to update the subject
  updateRefreshTokenSubject(token: string | null) {
    this.refreshSubject.next(token);
  }
}
