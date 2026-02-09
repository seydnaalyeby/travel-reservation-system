import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, UserCreateRequest, UserUpdateRequest } from '../core/auth/auth.models';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/api/admin/users`);
  }

  get(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/api/admin/users/${id}`);
  }

  create(req: UserCreateRequest): Observable<User> {
    return this.http.post<User>(`${this.base}/api/admin/users`, req);
  }

  update(id: number, req: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.base}/api/admin/users/${id}`, req);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/admin/users/${id}`);
  }

  setEnabled(id: number, value: boolean): Observable<User> {
    const params = new HttpParams().set('value', value);
    return this.http.patch<User>(`${this.base}/api/admin/users/${id}/enabled`, null, { params });
  }
}
