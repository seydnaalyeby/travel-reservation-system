import { Injectable } from '@angular/core';
import { Role } from './auth.models';

const KEY_ACCESS = 'accessToken';
const KEY_REFRESH = 'refreshToken';
const KEY_ROLE = 'auth_role';
const KEY_USER = 'auth_user';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  setSession(
    role: Role,
    user: { userId: number; fullName: string; email: string }
  ) {
    console.log('💾 Storing session data:', { role, user });
    localStorage.setItem(KEY_ROLE, role);
    localStorage.setItem(KEY_USER, JSON.stringify(user));
    console.log('✅ Session data stored in localStorage');
  }

  setTokens(accessToken: string, refreshToken?: string) {
    console.log('💾 Storing tokens:');
    console.log('Access token length:', accessToken.length);
    console.log('Refresh token length:', refreshToken?.length || 0);
    
    if (accessToken) localStorage.setItem(KEY_ACCESS, accessToken);
    if (refreshToken) localStorage.setItem(KEY_REFRESH, refreshToken);
    
    console.log('✅ Tokens stored in localStorage');
    console.log('Current localStorage keys:', Object.keys(localStorage));
  }

  clear() {
    console.log('🗑️ Clearing all auth data...');
    localStorage.removeItem(KEY_ACCESS);
    localStorage.removeItem(KEY_REFRESH);
    localStorage.removeItem(KEY_ROLE);
    localStorage.removeItem(KEY_USER);
    console.log('✅ Auth data cleared from localStorage');
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem(KEY_ACCESS);
    console.log('🔍 Getting access token:', !!token, token?.length || 0);
    return token;
  }

  getRefreshToken(): string | null {
    const token = localStorage.getItem(KEY_REFRESH);
    console.log('🔍 Getting refresh token:', !!token, token?.length || 0);
    return token;
  }

  getRole(): Role | null {
    return (localStorage.getItem(KEY_ROLE) as Role) ?? null;
  }

  getUser(): { userId: number; fullName: string; email: string } | null {
    const raw = localStorage.getItem(KEY_USER);
    return raw ? JSON.parse(raw) : null;
  }
}
