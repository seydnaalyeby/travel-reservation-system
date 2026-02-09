import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { HotelService } from '../../../services/hotel.service';
import { Hotel } from '../../../models/hotel.model';
import { HotelFormComponent } from './hotel-form.component';

type SortBy = 'nom' | 'etoiles' | 'prixParNuit' | 'chambresTotales';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './hotel-list.component.html',
  styleUrls: ['./hotel-list.component.scss']
})
export class HotelListComponent implements OnInit {
  // Données
  hotels = signal<Hotel[]>([]);
  loading = signal<boolean>(false);
  
  // Filtres
  filters = signal({
    q: '',
    etoiles: null as number | null,
    prixMax: null as number | null,
    sortBy: 'nom' as SortBy,
    sortDir: 'asc' as SortDir
  });

  // Pagination
  pageSize = 10;
  currentPage = 0;

  // Colonnes affichées
  displayedColumns: string[] = [
    'id', 'nom', 'localisation', 'etoiles', 'prixParNuit',
    'chambresTotales', 'equipements', 'actions'
  ];

  // Computed values
  totalCount = computed(() => this.hotels().length);

  filteredHotels = computed(() => {
    let result = [...this.hotels()];
    const currentFilters = this.filters();

    // Filtre par texte
    if (currentFilters.q.trim()) {
      const searchTerm = currentFilters.q.toLowerCase().trim();
      result = result.filter(hotel => {
        const searchableText = [
          hotel.nom?.toLowerCase() || '',
          hotel.ville?.toLowerCase() || '',
          hotel.pays?.toLowerCase() || '',
          (hotel as any).adresse?.toLowerCase() || ''
        ].join(' ');
        
        return searchableText.includes(searchTerm);
      });
    }

    // Filtre par étoiles
    if (currentFilters.etoiles !== null) {
      result = result.filter(hotel => hotel.etoiles === currentFilters.etoiles);
    }

    // Filtre par prix max
    if (currentFilters.prixMax !== null && currentFilters.prixMax > 0) {
      result = result.filter(hotel => 
        hotel.prixParNuit <= currentFilters.prixMax!
      );
    }

    // Tri
    result.sort((a: any, b: any) => {
      const aValue = a[currentFilters.sortBy];
      const bValue = b[currentFilters.sortBy];

      // Pour les strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return currentFilters.sortDir === 'asc' ? comparison : -comparison;
      }

      // Pour les nombres
      const aNum = Number(aValue) || 0;
      const bNum = Number(bValue) || 0;
      return currentFilters.sortDir === 'asc' ? aNum - bNum : bNum - aNum;
    });

    return result;
  });

  shownCount = computed(() => this.filteredHotels().length);

  paginatedHotels = computed(() => {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredHotels().slice(start, end);
  });

  constructor(
    private hotelService: HotelService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // Reset pagination quand les filtres changent
    effect(() => {
      this.filters(); // Écoute les changements de filtres
      this.currentPage = 0; // Reset à la première page
    });
  }

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.loading.set(true);
    this.hotelService.getAllHotels().subscribe({
      next: (hotels: Hotel[]) => {
        this.hotels.set(hotels || []);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.snackBar.open('Erreur lors du chargement des hôtels', 'Fermer', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  // Méthodes de filtrage
  applyFilters(): void {
    // Mettre à jour le signal filters déclenchera automatiquement le computed
    this.filters.set({...this.filters()});
  }

  resetFilters(): void {
    this.filters.set({
      q: '',
      etoiles: null,
      prixMax: null,
      sortBy: 'nom',
      sortDir: 'asc'
    });
  }

  // Méthodes de pagination
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  // Méthodes CRUD
  openForm(hotel?: Hotel): void {
    const dialogRef = this.dialog.open(HotelFormComponent, {
      width: '760px',
      maxWidth: '92vw',
      data: hotel,
      panelClass: 'hotel-dialog'
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) this.loadHotels();
    });
  }

  deleteHotel(hotel: Hotel): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'hôtel "${hotel.nom}" ?`)) {
      return;
    }

    this.hotelService.deleteHotel(hotel.id!).subscribe({
      next: () => {
        this.snackBar.open('Hôtel supprimé avec succès', 'Fermer', { 
          duration: 2500,
          panelClass: ['success-snackbar']
        });
        this.loadHotels();
      },
      error: (err: any) => {
        this.snackBar.open(
          err?.error?.message || 'Erreur lors de la suppression', 
          'Fermer', 
          { 
            duration: 3000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  // Méthodes utilitaires UI
  getAverageStars(): number {
    const hotels = this.hotels();
    if (hotels.length === 0) return 0;
    const total = hotels.reduce((sum, hotel) => sum + (hotel.etoiles || 0), 0);
    return Math.round((total / hotels.length) * 10) / 10;
  }

  getAveragePrice(): number {
    const hotels = this.hotels();
    if (hotels.length === 0) return 0;
    const total = hotels.reduce((sum, hotel) => sum + (hotel.prixParNuit || 0), 0);
    return Math.round(total / hotels.length);
  }

  hasActiveFilters(): boolean {
    const f = this.filters();
    return !!f.q.trim() || 
           f.etoiles !== null || 
           (f.prixMax !== null && f.prixMax > 0) ||
           f.sortBy !== 'nom' ||
           f.sortDir !== 'asc';
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredHotels().length / this.pageSize);
  }

  exportToCSV(): void {
    const hotels = this.filteredHotels();
    const headers = ['ID', 'Nom', 'Ville', 'Pays', 'Étoiles', 'Prix/nuit', 'Chambres'];
    const csvData = hotels.map(h => [
      h.id,
      `"${h.nom}"`,
      `"${h.ville}"`,
      `"${h.pays}"`,
      h.etoiles,
      h.prixParNuit,
      h.chambresTotales
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hotels_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.snackBar.open('Export CSV généré avec succès', 'Fermer', { duration: 2000 });
  }

  getStarsArray(count: number): number[] {
    return Array.from({ length: count || 0 }, (_, i) => i);
  }

  safeEquipements(h: Hotel): string[] {
    return Array.isArray((h as any).equipements) ? (h as any).equipements : [];
  }
}