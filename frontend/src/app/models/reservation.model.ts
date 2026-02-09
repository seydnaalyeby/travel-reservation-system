export type ReservationStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELED';

export interface ReservationResponse {
  id: number;
  type: 'VOL' | 'HOTEL';
  status: ReservationStatus;
  totalPrice: number;
  createdAt: string;

  // VOL
  volId?: number;
  volInfo?: string;
  nbPlaces?: number;
  volRetourId?: number;
   volRetourInfo?: string;
  // HOTEL
  hotelId?: number;
  hotelName?: string;
  checkIn?: string;
  checkOut?: string;
  rooms?: number;

  // (optionnel si ton backend le renvoie)
  paymentId?: number;
  paymentStatus?: string;
}
