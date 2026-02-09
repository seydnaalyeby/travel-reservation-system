import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vol } from '../models/vol.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VolService {
  // URL correcte selon ta SecurityConfig : /api/admin/**
  private apiUrl = `${environment.apiUrl}/api/admin/vols`;

  constructor(private http: HttpClient) {}

  getAllVols(): Observable<Vol[]> {
    return this.http.get<Vol[]>(this.apiUrl);
  }

  getVolById(id: number): Observable<Vol> {
    return this.http.get<Vol>(`${this.apiUrl}/${id}`);
  }

  createVol(vol: Vol): Observable<Vol> {
    return this.http.post<Vol>(this.apiUrl, vol);
  }

  updateVol(id: number, vol: Vol): Observable<Vol> {
    return this.http.put<Vol>(`${this.apiUrl}/${id}`, vol);
  }

  deleteVol(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
