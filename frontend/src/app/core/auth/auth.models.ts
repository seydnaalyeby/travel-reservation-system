export type Role = 'ADMIN' | 'CLIENT';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface User {
  createdAt: any;
  phone: string;
  id: number;
  fullName: string;
  email: string;
  role: Role;
  enabled: boolean;
}

export interface UserCreateRequest {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  enabled?: boolean;
}

export interface UserUpdateRequest {
  fullName?: string;
  email?: string;
  password?: string;
  role?: Role;
  enabled?: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
