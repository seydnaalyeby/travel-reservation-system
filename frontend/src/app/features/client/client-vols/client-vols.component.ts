import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import { Vol } from '../../../models/vol.model';

@Component({
  selector: 'app-client-vols',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-vols.component.html',
  styleUrls: ['./client-vols.component.scss']
})
export class ClientVolsComponent implements OnInit {

  vols: Vol[] = [];
  allVols: Vol[] = [];
  loading = false;
  reserving = false;
  message = '';

  /* filters */
  fDepart = '';
  fArrivee = '';
  fDate = '';
  fPrixMax: number | null = null;
  fOnlyAvailable = false;

  roundTrip = false;
  selectedAller: Vol | null = null;
  selectedRetour: Vol | null = null;
  selectedVol: Vol | null = null;

  nbPlacesSelection = 1;

  constructor(private client: ClientService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.client.getVols().subscribe({
      next: d => {
        this.allVols = d;
        this.applyFilters();
        this.loading = false;
      },
      error: e => {
        this.message = e?.error?.message || 'Erreur';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.vols = this.allVols.filter(v => {
      if (this.fDepart && !v.aeroportDepart.toLowerCase().includes(this.fDepart.toLowerCase())) return false;
      if (this.fArrivee && !v.aeroportArrivee.toLowerCase().includes(this.fArrivee.toLowerCase())) return false;
      if (this.fDate && !v.dateHeureDepart.startsWith(this.fDate)) return false;
      if (this.fPrixMax != null && v.prixBase > this.fPrixMax) return false;
      if (this.fOnlyAvailable && v.placesDisponibles <= 0) return false;
      return true;
    });
  }

  resetFilters() {
    this.fDepart = this.fArrivee = this.fDate = '';
    this.fPrixMax = null;
    this.fOnlyAvailable = false;
    this.applyFilters();
  }

  onToggleRoundTrip() {
    this.selectedRetour = null;
  }

  selectAller(v: Vol) {
    this.selectedAller = v;
    this.selectedRetour = null;
  }

  selectRetour(v: Vol) {
    if (v.id !== this.selectedAller?.id) this.selectedRetour = v;
  }

  maxPlacesSelection(): number {
    if (!this.selectedAller) return 0;
    if (!this.roundTrip) return this.selectedAller.placesDisponibles;
    if (!this.selectedRetour) return 0;
    return Math.min(this.selectedAller.placesDisponibles, this.selectedRetour.placesDisponibles);
  }

  canReserveSelection(): boolean {
    return !!this.selectedAller &&
           this.nbPlacesSelection > 0 &&
           this.nbPlacesSelection <= this.maxPlacesSelection() &&
           (!this.roundTrip || !!this.selectedRetour);
  }

  reserveSelection() {
    if (!this.canReserveSelection()) return;
    this.reserving = true;
    this.message = '';
    this.client.reserveVol(
      this.selectedAller!.id!,
      this.nbPlacesSelection,
      this.roundTrip ? this.selectedRetour!.id! : undefined
    ).subscribe({
      next: () => {
        this.message = '✅ Réservation effectuée avec succès';
        this.reserving = false;
        this.selectedAller = null;
        this.selectedRetour = null;
        this.roundTrip = false;
        this.nbPlacesSelection = 1;
        this.load();
      },
      error: e => {
        this.message = e?.error?.message || 'Erreur lors de la réservation';
        this.reserving = false;
      }
    });
  }

  openDetails(v: Vol) {
    this.selectedVol = v;
  }

  closeDetails() {
    this.selectedVol = null;
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

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
}

