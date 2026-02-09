import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type ReservationType = 'VOL' | 'HOTEL';
export type ReservationStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELED';

export interface AdminReservationRow {
  ref: string;
  id: number;
  clientName: string;
  clientEmail: string;
  type: ReservationType;
  createdAt: string;
  amount: number;
  status: ReservationStatus;
}

@Injectable({ providedIn: 'root' })
export class AdminReservationsService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  all(): Observable<AdminReservationRow[]> {
    return this.http.get<AdminReservationRow[]>(`${this.base}/api/admin/reservations`);
  }

  cancel(r: AdminReservationRow) {
    const url =
      r.type === 'VOL'
        ? `${this.base}/api/admin/reservations/vol/${r.id}/cancel`
        : `${this.base}/api/admin/reservations/hotel/${r.id}/cancel`;
    return this.http.patch<void>(url, {});
  }

  remove(r: AdminReservationRow) {
    const url =
      r.type === 'VOL'
        ? `${this.base}/api/admin/reservations/vol/${r.id}`
        : `${this.base}/api/admin/reservations/hotel/${r.id}`;
    return this.http.delete<void>(url);
  }
}
