import { Injectable } from '@angular/core';

type JwtPayload = { exp?: number; [k: string]: any };

@Injectable({ providedIn: 'root' })
export class JwtHelper {
  decode<T = JwtPayload>(token: string): T | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const json = decodeURIComponent(
        atob(payload)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }

  isExpired(token: string, skewSeconds = 30): boolean {
    const payload = this.decode<JwtPayload>(token);
    if (!payload?.exp) return true; // if no exp, treat as expired

    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp <= (nowSec + skewSeconds);
  }
}
