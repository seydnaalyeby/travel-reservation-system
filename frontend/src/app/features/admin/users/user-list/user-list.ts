import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AdminUsersService } from '../../../../services/user.service';
import { User } from '../../../../core/auth/auth.models';
import { UserFormComponent } from '../user-form/user-form';

type RoleFilter = 'ALL' | 'ADMIN' | 'CLIENT' | 'AGENT';
type StatusFilter = 'ALL' | 'ENABLED' | 'DISABLED';
type SortBy = 'fullName' | 'email' | 'role' | 'createdAt';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  dataSource = new MatTableDataSource<User>([]);
  loading = false;
  error = '';

  // Filtres
  search = '';
  roleFilter: RoleFilter = 'ALL';
  statusFilter: StatusFilter = 'ALL';
  sortBy: SortBy = 'fullName';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination + sort
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: AdminUsersService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.dataSource.filterPredicate = this.filterPredicate();
    this.load();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.list().subscribe({
      next: (data) => {
        this.users = data;
        this.dataSource.data = data;
        if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('USERS API ERROR =>', err);
        this.error = 'Impossible de charger les utilisateurs';
        this.loading = false;
      }
    });
  }

  // Modal create
  add() {
    const ref = this.dialog.open(UserFormComponent, {
      width: '720px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: true,
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe((res) => {
      if (res?.refresh) this.load();
    });
  }

  // Modal edit
  edit(u: User) {
    const ref = this.dialog.open(UserFormComponent, {
      width: '720px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: true,
      data: { mode: 'edit', id: u.id }
    });

    ref.afterClosed().subscribe((res) => {
      if (res?.refresh) this.load();
    });
  }

  toggleEnabled(u: User) {
    this.api.setEnabled(u.id, !u.enabled).subscribe({
      next: (updated) => {
        this.users = this.users.map(x => x.id === updated.id ? updated : x);
        this.dataSource.data = this.users;
        this.applyFilters();
        this.snack.open(`Utilisateur ${updated.enabled ? 'activé' : 'désactivé'}`, 'OK', { 
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: () => this.snack.open('Action impossible', 'OK', { 
        duration: 2000,
        panelClass: ['error-snackbar']
      })
    });
  }

  remove(u: User) {
    if (!confirm(`Supprimer ${u.fullName} ?`)) return;

    this.api.remove(u.id).subscribe({
      next: () => {
        this.users = this.users.filter(x => x.id !== u.id);
        this.dataSource.data = this.users;
        this.applyFilters();
        this.snack.open('Utilisateur supprimé', 'OK', { 
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: () => this.snack.open('Suppression impossible', 'OK', { 
        duration: 2000,
        panelClass: ['error-snackbar']
      })
    });
  }

  // Appelé depuis HTML
  applyFilters() {
    const payload = {
      search: (this.search || '').trim().toLowerCase(),
      role: this.roleFilter,
      status: this.statusFilter
    };
    this.dataSource.filter = JSON.stringify(payload);
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  resetFilters() {
    this.search = '';
    this.roleFilter = 'ALL';
    this.statusFilter = 'ALL';
    this.applyFilters();
  }

  private filterPredicate() {
    return (user: User, filterStr: string) => {
      const f = JSON.parse(filterStr || '{}') as { search: string; role: RoleFilter; status: StatusFilter };

      // Recherche texte
      const txt = (f.search || '');
      if (txt) {
        const hay = `${user.id} ${user.fullName} ${user.email} ${user.role} ${user.phone || ''}`.toLowerCase();
        if (!hay.includes(txt)) return false;
      }

      // Filtre rôle
      if (f.role && f.role !== 'ALL') {
        if ((user.role || '').toUpperCase() !== f.role) return false;
      }

      // Filtre statut
      if (f.status && f.status !== 'ALL') {
        if (f.status === 'ENABLED' && !user.enabled) return false;
        if (f.status === 'DISABLED' && user.enabled) return false;
      }

      return true;
    };
  }

  // Méthodes utilitaires UI
  totalUsers(): number {
    return this.users.length;
  }

  activeUsers(): number {
    return this.users.filter(u => u.enabled).length;
  }

  adminUsers(): number {
    return this.users.filter(u => u.role === 'ADMIN').length;
  }

  hasActiveFilters(): boolean {
    return !!this.search.trim() || 
           this.roleFilter !== 'ALL' || 
           this.statusFilter !== 'ALL';
  }

  showAllUsers(): void {
    this.resetFilters();
  }

  toggleRoleFilter(role: RoleFilter): void {
    if (this.roleFilter === role) {
      this.roleFilter = 'ALL';
    } else {
      this.roleFilter = role;
    }
    this.applyFilters();
  }

  toggleStatusFilter(status: StatusFilter): void {
    if (this.statusFilter === status) {
      this.statusFilter = 'ALL';
    } else {
      this.statusFilter = status;
    }
    this.applyFilters();
  }

  applySorting(): void {
    // Implémenter le tri si nécessaire
  }

  refresh(): void {
    this.load();
  }

  exportToCSV(): void {
    const users = this.dataSource.filteredData;
    const headers = ['ID', 'Nom complet', 'Email', 'Rôle', 'Statut', 'Téléphone', 'Date création'];
    const csvData = users.map(u => [
      u.id,
      `"${u.fullName}"`,
      `"${u.email}"`,
      u.role,
      u.enabled ? 'Actif' : 'Inactif',
      u.phone || '',
      u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : ''
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.snack.open('Export CSV généré avec succès', 'Fermer', { 
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  getInitials(fullName: string): string {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getAvatarClass(user: User): string {
    switch (user.role?.toUpperCase()) {
      case 'ADMIN': return 'admin-avatar';
      case 'CLIENT': return 'client-avatar';
      case 'AGENT': return 'agent-avatar';
      default: return 'default-avatar';
    }
  }

  getRoleClass(user: User): string {
    switch (user.role?.toUpperCase()) {
      case 'ADMIN': return 'admin-badge';
      case 'CLIENT': return 'client-badge';
      case 'AGENT': return 'agent-badge';
      default: return 'default-badge';
    }
  }

  getRoleIcon(role: string): string {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'admin_panel_settings';
      case 'CLIENT': return 'person';
      case 'AGENT': return 'support_agent';
      default: return 'badge';
    }
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  viewDetails(user: User): void {
    this.snack.open(`Détails de ${user.fullName}`, 'Fermer', { duration: 2000 });
  }

  sendResetPassword(user: User): void {
    this.snack.open(`Réinitialisation envoyée à ${user.email}`, 'Fermer', { duration: 2000 });
  }
}