import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MonthPoint {
  month: string;   // "2026-02"
  count: number;
  revenue: number;
}
export interface LabelValue {
  label: string;
  value: number;
}
export interface AdminReservationStatsResponse {
  totalCount: number;
  volCount: number;
  hotelCount: number;

  pendingCount: number;
  confirmedCount: number;
  canceledCount: number;

  cancelRatePercent: number;
  revenueConfirmedTotal: number;

  monthly: MonthPoint[];
  byType: LabelValue[];
  byStatus: LabelValue[];
  topClients: TopClient[];
}
export interface TopClient {
  clientId: number;
  clientName: string;
  clientEmail: string;
  reservationsCount: number;
  revenueConfirmed: number;
}

@Injectable({ providedIn: 'root' })
export class AdminReservationsStatsService {
  private base = environment.apiUrl;
 
  constructor(private http: HttpClient,) {}

  getStats(from: string, to: string): Observable<AdminReservationStatsResponse> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<AdminReservationStatsResponse>(
      `${this.base}/api/admin/stats/reservations`,
      { params }
    );
  }
}
