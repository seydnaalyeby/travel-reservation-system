import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { PayRequest, Payment } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private base = environment.apiUrl; // مثال: http://localhost:8081

  constructor(private http: HttpClient) {}

  payVol(reservationId: number, req: PayRequest): Observable<Payment> {
    // ✅ vol (singulier)
    return this.http.post<Payment>(`${this.base}/api/client/payments/vol/${reservationId}`, req);
  }

  payHotel(reservationId: number, req: PayRequest): Observable<Payment> {
    // ✅ hotel (singulier)
    return this.http.post<Payment>(`${this.base}/api/client/payments/hotel/${reservationId}`, req);
  }
}

