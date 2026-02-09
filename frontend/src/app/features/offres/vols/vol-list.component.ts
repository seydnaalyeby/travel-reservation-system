import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Vol } from '../../../models/vol.model';
import { VolService } from '../../../services/vol.service';
import { VolFormComponent } from '../vols/vol-form.component';

type VolStatut = 'DISPONIBLE' | 'COMPLET' | 'ANNULE';

// ✅ Ajoutez cette interface
interface ConfirmDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-vol-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './vol-list.component.html',
  styleUrls: ['./vol-list.component.scss']
})
export class VolListComponent implements OnInit, AfterViewInit {
  loading = false;
  
  displayedColumns: string[] = [
    'numeroVol', 'compagnie', 'trajet', 'depart', 'arrivee', 'places', 'prix', 'statut', 'actions'
  ];

  dataSource = new MatTableDataSource<Vol>([]);
  total = 0;

  q = new FormControl<string>('', { nonNullable: true });
  statut = new FormControl<VolStatut | ''>('', { nonNullable: true });
  minPlaces = new FormControl<number | null>(null);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private volService: VolService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private setupFilters(): void {
    this.q.valueChanges.subscribe(() => this.applyFilters());
    this.statut.valueChanges.subscribe(() => this.applyFilters());
    this.minPlaces.valueChanges.subscribe(() => this.applyFilters());

    this.dataSource.filterPredicate = (v: Vol, _filter: string) => {
      const q = (this.q.value || '').trim().toLowerCase();
      const st = this.statut.value;
      const minP = this.minPlaces.value;

      const blob = [
        v.numeroVol, v.compagnie, v.aeroportDepart, v.aeroportArrivee
      ].join(' ').toLowerCase();
      const okQ = !q || blob.includes(q);

      const okS = !st || (String(v.statut).toUpperCase() === st);

      const places = Number(v.placesDisponibles ?? 0);
      const okP = (minP == null) || (places >= minP);

      return okQ && okS && okP;
    };
  }

  load(): void {
    this.loading = true;
    this.volService.getAllVols().subscribe({
      next: (data: Vol[]) => {
        this.total = data.length;
        this.dataSource.data = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.snack.open(
          err?.error?.message || 'Erreur chargement vols',
          'Fermer',
          { duration: 3000 }
        );
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.dataSource.filter = String(Date.now());
    if (this.paginator) this.paginator.firstPage();
  }

  resetFilters(): void {
    this.q.setValue('');
    this.statut.setValue('');
    this.minPlaces.setValue(null);
    this.applyFilters();
  }

  openCreate(): void {
    const ref = this.dialog.open(VolFormComponent, {
      width: '820px',
      maxWidth: '92vw',
      data: undefined
    });

    ref.afterClosed().subscribe((ok) => {
      if (ok) this.load();
    });
  }

  openEdit(v: Vol): void {
    const ref = this.dialog.open(VolFormComponent, {
      width: '820px',
      maxWidth: '92vw',
      data: v
    });

    ref.afterClosed().subscribe((ok) => {
      if (ok) this.load();
    });
  }

  delete(v: Vol): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Supprimer ce vol ?',
        message: `Voulez-vous vraiment supprimer le vol ${v.numeroVol} ?`
      } as ConfirmDialogData // ✅ Utilisez l'interface
    });

    ref.afterClosed().subscribe((yes) => {
      if (!yes) return;

      this.volService.deleteVol(v.id!).subscribe({
        next: () => {
          this.snack.open('Vol supprimé', 'Fermer', { duration: 2000 });
          this.load();
        },
        error: (err) => {
          this.snack.open(err?.error?.message || 'Erreur suppression', 'Fermer', { duration: 3000 });
        }
      });
    });
  }

  badgeClass(v: Vol): string {
    const st = String(v.statut || '').toUpperCase();
    if (st === 'ANNULE') return 'badge badge-cancel';
    if (Number(v.placesDisponibles ?? 0) <= 0 || st === 'COMPLET') return 'badge badge-warn';
    return 'badge badge-ok';
  }

  formatDate(d: any): string {
    const date = new Date(d);
    if (isNaN(date.getTime())) return String(d ?? '');
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(d: any): string {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  shownCount(): number {
    return this.dataSource.filteredData.length;
  }

  hasActiveFilters(): boolean {
    return !!this.q.value || !!this.statut.value || this.minPlaces.value !== null;
  }

  getSeatsPercentage(v: Vol): number {
    const total = 180;
    const available = v.placesDisponibles || 0;
    return Math.min(100, (available / total) * 100);
  }
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-icon">
        <mat-icon>warning</mat-icon>
      </div>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <div mat-dialog-content class="muted">{{ data.message }}</div>
      <div mat-dialog-actions align="end">
        <button mat-button (click)="ref.close(false)">Annuler</button>
        <button mat-raised-button color="warn" (click)="ref.close(true)">Supprimer</button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      text-align: center;
      padding: 8px;
    }
    .dialog-icon {
      color: #ef4444;
      margin-bottom: 16px;
    }
    .dialog-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public ref: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData // ✅ Utilisez l'interface
  ) {}
}