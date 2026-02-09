import { Component, OnInit } from '@angular/core';
import {  FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'; // ajuste si besoin
import { catchError, of } from 'rxjs';
import { AdminReservationsService } from '../../../services/admin-reservations.service';
export type ReservationType = 'VOL' | 'HOTEL';
export type ReservationStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELED';

export interface AdminReservationRow {
  ref: string;          // "VOL-12" / "HOTEL-7"
  id: number;
  clientName: string;
  clientEmail: string;
  type: ReservationType;
  createdAt: string;    // ISO string
  amount: number;       // BigDecimal -> number côté front
  status: ReservationStatus;
}

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass],
  templateUrl: './reservations.html',
  styleUrls: ['./reservations.scss']
})
export class ReservationsComponent implements OnInit {

  loading = false;
  message = '';

  rows: AdminReservationRow[] = [];
  filtered: AdminReservationRow[] = [];

  // filtres
  q = '';
  type: 'ALL' | ReservationType = 'ALL';
  status: 'ALL' | ReservationStatus = 'ALL';

  // KPI
  total = 0;
  volCount = 0;
  hotelCount = 0;
  private base = environment.apiUrl;

  constructor(private http: HttpClient,private api: AdminReservationsService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.message = '';

    this.http.get<AdminReservationRow[]>(`${this.base}/api/admin/reservations`)
      .pipe(
        catchError(err => {
          console.error(err);
          this.message = err?.error?.message || 'Erreur chargement réservations';
          return of([]);
        })
      )
      .subscribe(data => {
        this.rows = data || [];
        this.computeKpis();
        this.applyFilters();
        this.loading = false;
      });
  }

  computeKpis() {
    this.total = this.rows.length;
    this.volCount = this.rows.filter(r => r.type === 'VOL').length;
    this.hotelCount = this.rows.filter(r => r.type === 'HOTEL').length;
  }

  applyFilters() {
    const q = (this.q || '').trim().toLowerCase();

    this.filtered = this.rows.filter(r => {
      const matchesQ =
        !q ||
        (r.ref || '').toLowerCase().includes(q) ||
        (r.clientName || '').toLowerCase().includes(q) ||
        (r.clientEmail || '').toLowerCase().includes(q);

      const matchesType = this.type === 'ALL' || r.type === this.type;
      const matchesStatus = this.status === 'ALL' || r.status === this.status;

      return matchesQ && matchesType && matchesStatus;
    });
  }

  resetFilters() {
    this.q = '';
    this.type = 'ALL';
    this.status = 'ALL';
    this.applyFilters();
  }

  // ⚠️ Actions : pour l’instant juste placeholders (tu me dis ce que tu veux)
  view(r: AdminReservationRow) {
    alert(`Détails: ${r.ref} (${r.clientName})`);
  }

  // Ex: action annuler côté admin (à activer quand backend existe)
 cancel(r: AdminReservationRow) {
  if (r.status === 'CONFIRMED') {
    this.message = "Impossible d'annuler une réservation CONFIRMED";
    return;
  }
  if (!confirm(`Annuler la réservation ${r.ref} ?`)) return;

  this.api.cancel(r).subscribe({
    next: () => { this.message = '✅ Annulation OK'; this.load(); },
    error: err => { this.message = err?.error?.message || 'Erreur annulation'; }
  });
}

remove(r: AdminReservationRow) {
  if (r.status === 'CONFIRMED') {
    this.message = "Impossible de supprimer une réservation CONFIRMED";
    return;
  }
  if (!confirm(`Supprimer DÉFINITIVEMENT ${r.ref} ?`)) return;

  this.api.remove(r).subscribe({
    next: () => { this.message = '✅ Suppression OK'; this.load(); },
    error: err => { this.message = err?.error?.message || 'Erreur suppression'; }
  });
}


  formatDate(s: string) {
    if (!s) return '';
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleString();
  }

  formatAmount(n: number) {
    if (n == null) return '';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
  }
  
  

}
