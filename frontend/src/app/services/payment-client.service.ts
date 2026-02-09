import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PayRequest {
  method: 'CARD' | 'CASH' | 'WALLET'; // مطابق backend: CARD/CASH/WALLET
}

export interface PaymentResponse {
  id: number;
  reference: string;
  amount: number;
  status: string;   // "PAID"
  method: string;   // "CARD"
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentClientService {
  private baseUrl = 'http://localhost:8081/api/client/payments';

  constructor(private http: HttpClient) {}

  payVol(reservationId: number, body: PayRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.baseUrl}/vol/${reservationId}`, body);
  }

  payHotel(reservationId: number, body: PayRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.baseUrl}/hotel/${reservationId}`, body);
  }
}

