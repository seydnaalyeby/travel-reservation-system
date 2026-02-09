export type PaymentMethod = 'CARD' | 'CASH' | 'MOBILE_MONEY';
export type PaymentStatus = 'PAID' | 'FAILED';

export interface PayRequest {
  method: PaymentMethod;
  success: boolean;
}

export interface Payment {
  id?: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt?: string;
}

