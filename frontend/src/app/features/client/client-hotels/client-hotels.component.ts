import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import { Hotel } from '../../../models/hotel.model';

@Component({
  selector: 'app-client-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-hotels.component.html',
  styleUrls: ['./client-hotels.component.scss']
})
export class ClientHotelsComponent implements OnInit {
  hotels: Hotel[] = [];
  loading = false;
  message = '';

  rooms: Record<number, number> = {};
  checkIn: Record<number, string> = {};
  checkOut: Record<number, string> = {};

  allHotels: Hotel[] = [];

  // Filters
  fVille = '';
  fPays = '';
  fPrixMin: number | null = null;
  fPrixMax: number | null = null;
  fStars: number | null = null;
  fOnlyAvailable = false;

  // Details modal
  selectedHotel: Hotel | null = null;
  reservingHotelId: number | null = null;

  constructor(private client: ClientService) {}

  ngOnInit() {
    this.load();
  }

  todayISO(): string {
    return new Date().toISOString().substring(0, 10);
  }

  private plusDaysISO(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().substring(0, 10);
  }

  private norm(s: any): string {
    return (s ?? '').toString().trim().toLowerCase();
  }

  load() {
    this.loading = true;
    this.client.getHotels().subscribe({
      next: data => {
        this.allHotels = data;

        for (const h of data) {
          if (!h.id) continue;
          if (this.rooms[h.id] == null) this.rooms[h.id] = 1;
          if (this.checkIn[h.id] == null) this.checkIn[h.id] = this.todayISO();
          if (this.checkOut[h.id] == null) this.checkOut[h.id] = this.plusDaysISO(2);
        }

        this.applyFilters();
        this.loading = false;
      },
      error: err => {
        this.message = err?.error?.message || 'Erreur';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    const ville = this.norm(this.fVille);
    const pays = this.norm(this.fPays);

    this.hotels = (this.allHotels || []).filter(h => {
      const hv = this.norm(h.ville);
      const hp = this.norm(h.pays);
      const prix = Number(h.prixParNuit ?? 0);
      const dispo = Number(h.chambresDisponibles ?? 0);

      if (ville && !hv.includes(ville)) return false;
      if (pays && !hp.includes(pays)) return false;

      if (this.fPrixMin != null && prix < this.fPrixMin) return false;
      if (this.fPrixMax != null && prix > this.fPrixMax) return false;

      if (this.fOnlyAvailable && dispo <= 0) return false;

      if (this.fStars != null && Number(h.etoiles ?? 0) !== this.fStars) return false;

      return true;
    });
  }

  resetFilters() {
    this.fVille = '';
    this.fPays = '';
    this.fPrixMin = null;
    this.fPrixMax = null;
    this.fStars = null;
    this.fOnlyAvailable = false;
    this.applyFilters();
  }

  openDetails(h: Hotel) {
    this.selectedHotel = h;
  }

  closeDetails() {
    this.selectedHotel = null;
  }

  starsText(n: number): string {
    const v = Math.max(0, Math.min(5, Number(n || 0)));
    return '★'.repeat(v) + '☆'.repeat(5 - v);
  }

  reserveFromModal() {
    if (!this.selectedHotel?.id) return;
    this.reserve(this.selectedHotel);
  }

  reserve(h: Hotel) {
    if (!h.id) return;
    
    this.message = '';
    this.reservingHotelId = h.id;
    const r = this.rooms[h.id] || 1;
    const ci = this.checkIn[h.id];
    const co = this.checkOut[h.id];

    if (!ci || !co) {
      this.message = 'Veuillez sélectionner les dates de séjour';
      this.reservingHotelId = null;
      return;
    }

    this.client.reserveHotel(h.id, ci, co, r).subscribe({
      next: () => {
        this.message = `✅ Hôtel réservé avec succès (${r} chambre(s))`;
        this.reservingHotelId = null;
        this.closeDetails();
        this.load();
      },
      error: err => {
        this.message = err?.error?.message || 'Erreur lors de la réservation';
        this.reservingHotelId = null;
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
      year: 'numeric'
    });
  }

  calculateNights(checkIn: string, checkOut: string): number {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateTotal(hotel: Hotel, checkIn: string, checkOut: string, rooms: number): number {
    const nights = this.calculateNights(checkIn, checkOut);
    return hotel.prixParNuit * nights * (rooms || 1);
  }
}

