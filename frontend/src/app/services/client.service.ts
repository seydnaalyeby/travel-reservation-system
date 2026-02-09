import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Vol } from '../models/vol.model';
import { Hotel } from '../models/hotel.model';
import { ReservationResponse } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // SEARCH
  getVols(): Observable<Vol[]> {
    return this.http.get<Vol[]>(`${this.base}/api/client/vols`);
  }

  getHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.base}/api/client/hotels`);
  }

  // RESERVE
 reserveVol(volId: number, nbPlaces: number, volRetourId?: number): Observable<ReservationResponse> {
  const body: any = { volId, nbPlaces };
  if (volRetourId != null) body.volRetourId = volRetourId;

  return this.http.post<ReservationResponse>(`${this.base}/api/client/reservations/vols`, body);
}


  reserveHotel(hotelId: number, checkIn: string, checkOut: string, rooms: number): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(`${this.base}/api/client/reservations/hotels`, {
      hotelId, checkIn, checkOut, rooms
    });
  }

  // MY RESERVATIONS
  myReservations(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${this.base}/api/client/reservations`);
  }

  // CANCEL VOL
cancelVol(reservationId: number) {
  return this.http.patch(
    `${this.base}/api/client/reservations/vol/${reservationId}/cancel`,
    {}
  );
}

// CANCEL HOTEL
cancelHotel(reservationId: number) {
  return this.http.patch(
    `${this.base}/api/client/reservations/hotel/${reservationId}/cancel`,
    {}
  );
}

}
