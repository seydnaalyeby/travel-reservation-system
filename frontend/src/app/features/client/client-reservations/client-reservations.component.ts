import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ClientService } from '../../../services/client.service';
import { ReservationResponse } from '../../../models/reservation.model';

@Component({
  selector: 'app-client-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-reservations.component.html',
  styleUrls: ['./client-reservations.component.scss']
})
export class ClientReservationsComponent implements OnInit {
  reservations: ReservationResponse[] = [];
  loading = false;
  message = '';
  cancelingId: number | null = null;

  constructor(
    private client: ClientService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.client.myReservations().subscribe({
      next: data => {
        this.reservations = data;
        this.loading = false;
      },
      error: err => {
        this.message = err?.error?.message || 'Erreur';
        this.loading = false;
      }
    });
  }

  goPay(r: ReservationResponse) {
    const type = (r.type || 'VOL').toUpperCase();
    this.router.navigate(['/client/pay', type, r.id]);
  }

  cancel(r: ReservationResponse) {
    if (!confirm(`Êtes-vous sûr de vouloir annuler cette réservation ?`)) {
      return;
    }

    this.message = '';
    this.cancelingId = r.id;

    const req$ = r.type === 'VOL'
      ? this.client.cancelVol(r.id)
      : this.client.cancelHotel(r.id);

    req$.subscribe({
      next: () => {
        this.message = '✅ Réservation annulée avec succès';
        this.cancelingId = null;
        this.load();
      },
      error: err => {
        this.message = err?.error?.message || 'Erreur lors de l\'annulation';
        this.cancelingId = null;
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'PENDING_PAYMENT':
        return 'status-pending';
      case 'CANCELED':
        return 'status-canceled';
      default:
        return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return '✅';
      case 'PENDING_PAYMENT':
        return '⏳';
      case 'CANCELED':
        return '❌';
      default:
        return '📋';
    }
  }

  getTypeIcon(type: string): string {
    return type === 'VOL' ? '✈️' : '🏨';
  }

  getPendingPaymentCount(): number {
    return this.reservations.filter(r => r.status === 'PENDING_PAYMENT').length;
  }

  getConfirmedCount(): number {
    return this.reservations.filter(r => r.status === 'CONFIRMED').length;
  }
}

