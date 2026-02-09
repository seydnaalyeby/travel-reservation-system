import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, forkJoin, catchError, of, Subscription } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Components
import { NavbarComponent } from '../../../layout/navbar/navbar';
import { SidebarComponent } from '../../../layout/sidebar/sidebar';

// Services
import { TokenStorageService } from '../../../core/auth/token-storage';
import { TopClient, AdminReservationsStatsService, AdminReservationStatsResponse } from '../../../services/admin-reservations-stats.service';
import { AdminReservationsService, AdminReservationRow } from '../../../services/admin-reservations.service';
import { VolService } from '../../../services/vol.service';
import { HotelService } from '../../../services/hotel.service';
import { AdminUsersService } from '../../../services/user.service';

// Register Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    SidebarComponent, 
    NavbarComponent, 
    RouterOutlet, 
    CommonModule, 
    FormsModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // Sidebar state
  collapsed = false;
  isAdminRoot = true;

  // KPI Counts
  volsCount = 0;
  hotelsCount = 0;
  usersCount = 0;
  totalReservationsCount = 0;
  volReservationsCount = 0;
  hotelReservationsCount = 0;

  // Statistics
  statsFrom = this.getFirstDayOfYear();
  statsTo = this.getToday();
  cancelRate = 0;
  loadingStats = false;
  statsError = '';

  // Top Clients
  topClients: TopClient[] = [];

  // Chart References
  @ViewChild('chartMonthlyCount') chartMonthlyCount!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartMonthlyRevenue') chartMonthlyRevenue!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartByType') chartByType!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartByStatus') chartByStatus!: ElementRef<HTMLCanvasElement>;

  // Chart Instances
  private chartMonthlyCountInstance?: Chart;
  private chartMonthlyRevenueInstance?: Chart;
  private chartByTypeInstance?: Chart;
  private chartByStatusInstance?: Chart;

  private viewReady = false;
  private routerSubscription?: Subscription;

  // Chart Configuration avec types appropriés
  private readonly chartConfig = {
    line: <ChartConfiguration<'line'>['options']>{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 13
          },
          bodyFont: {
            size: 13
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              size: 11
            },
            padding: 8
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            },
            maxRotation: 45
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'nearest'
      }
    },
    bar: <ChartConfiguration<'bar'>['options']>{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 13
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'MRU',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              size: 11
            },
            padding: 8,
            callback: function(value) {
              if (typeof value === 'number') {
                return new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'MRU',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(value);
              }
              return value;
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      }
    },
    doughnut: <ChartConfiguration<'doughnut'>['options']>{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            },
            generateLabels: function(chart) {
              const data = chart.data;
              if (data.labels && data.datasets && data.datasets[0]) {
                const dataset = data.datasets[0];
                
                // Gestion type-safe des couleurs
                const backgroundColor = Array.isArray(dataset.backgroundColor) 
                  ? dataset.backgroundColor 
                  : [];
                const borderColor = Array.isArray(dataset.borderColor)
                  ? dataset.borderColor
                  : typeof dataset.borderColor === 'string'
                    ? Array(data.labels.length).fill(dataset.borderColor)
                    : [];
                
                return data.labels.map((label, i) => ({
                  text: label,
                  fillStyle: backgroundColor[i] as string || '#ccc',
                  strokeStyle: borderColor[i] as string || '#ccc',
                  lineWidth: 1,
                  hidden: false,
                  index: i
                }));
              }
              return [];
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw as number;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '60%'
    }
  };

  constructor(
    private router: Router,
    private tokenStorage: TokenStorageService,
    private volService: VolService,
    private hotelService: HotelService,
    private adminUsersService: AdminUsersService,
    private adminReservationsService: AdminReservationsService,
    private statsService: AdminReservationsStatsService
  ) {
    this.initializeRouterListener();
  }

  ngOnInit(): void {
    this.checkAdminRoute();
    
    if (this.isAdminRoot) {
      this.loadKpis();
    }
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.isAdminRoot) {
      setTimeout(() => this.reloadStats(), 100);
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
    this.routerSubscription?.unsubscribe();
  }

  // Sidebar Methods
  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }

  logout(): void {
    this.tokenStorage.clear();
    this.router.navigateByUrl('/login');
  }

  // KPI Loading
  loadKpis(): void {
    forkJoin({
      vols: this.volService.getAllVols().pipe(
        catchError(err => {
          console.error('Error loading flights:', err);
          return of([]);
        })
      ),
      hotels: this.hotelService.getAllHotels().pipe(
        catchError(err => {
          console.error('Error loading hotels:', err);
          return of([]);
        })
      ),
      users: this.adminUsersService.list().pipe(
        catchError(err => {
          console.error('Error loading users:', err);
          return of([]);
        })
      ),
      reservations: this.adminReservationsService.all().pipe(
        catchError(err => {
          console.error('Error loading reservations:', err);
          return of([] as AdminReservationRow[]);
        })
      ),
    }).subscribe({
      next: (results) => {
        this.volsCount = results.vols.length;
        this.hotelsCount = results.hotels.length;
        this.usersCount = results.users.length;
        
        this.totalReservationsCount = results.reservations.length;
        this.volReservationsCount = results.reservations.filter(r => r.type === 'VOL').length;
        this.hotelReservationsCount = results.reservations.filter(r => r.type === 'HOTEL').length;
      },
      error: (error) => {
        console.error('Error loading KPIs:', error);
      }
    });
  }

  // Statistics Methods
  reloadStats(): void {
    if (this.statsFrom > this.statsTo) {
      [this.statsFrom, this.statsTo] = [this.statsTo, this.statsFrom];
    }

    this.loadingStats = true;
    this.statsError = '';

    this.statsService.getStats(this.statsFrom, this.statsTo).subscribe({
      next: (stats) => {
        this.cancelRate = Number((stats.cancelRatePercent || 0).toFixed(1));
        this.topClients = stats.topClients || [];

        if (this.viewReady) {
          this.renderCharts(stats);
        }

        this.loadingStats = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.statsError = error?.error?.message || 'Erreur lors du chargement des statistiques';
        this.loadingStats = false;
        
        this.clearCharts();
      }
    });
  }

  // Chart Methods
  private renderCharts(stats: AdminReservationStatsResponse): void {
    this.destroyCharts();

    // Monthly Reservations Chart
    if (stats.monthly?.length) {
      const months = stats.monthly.map(m => this.formatMonth(m.month));
      const counts = stats.monthly.map(m => m.count);

      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Nombre de réservations',
            data: counts,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        },
        options: this.chartConfig.line
      };

      this.chartMonthlyCountInstance = new Chart(this.chartMonthlyCount.nativeElement, config);
    }

    // Monthly Revenue Chart
    if (stats.monthly?.length) {
      const months = stats.monthly.map(m => this.formatMonth(m.month));
      const revenues = stats.monthly.map(m => Number(m.revenue || 0));

      const config: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: 'Chiffre d\'affaires (MRU)',
            data: revenues,
            backgroundColor: '#10b981',
            borderColor: '#0da271',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: this.chartConfig.bar
      };

      this.chartMonthlyRevenueInstance = new Chart(this.chartMonthlyRevenue.nativeElement, config);
    }

    // Type Distribution Chart
    if (stats.byType?.length) {
      const typeLabels = stats.byType.map(x => x.label);
      const typeValues = stats.byType.map(x => x.value);
      const backgroundColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

      const config: ChartConfiguration<'doughnut'> = {
        type: 'doughnut',
        data: {
          labels: typeLabels,
          datasets: [{
            label: 'Répartition par type',
            data: typeValues,
            backgroundColor: backgroundColors.slice(0, typeLabels.length),
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 15
          }]
        },
        options: this.chartConfig.doughnut
      };

      this.chartByTypeInstance = new Chart(this.chartByType.nativeElement, config);
    }

    // Status Distribution Chart
    if (stats.byStatus?.length) {
      const statusLabels = stats.byStatus.map(x => x.label);
      const statusValues = stats.byStatus.map(x => x.value);
      
      const statusColors = statusLabels.map(label => {
        switch(label.toLowerCase()) {
          case 'confirmé':
          case 'confirmed': return '#10b981';
          case 'en attente':
          case 'pending': return '#f59e0b';
          case 'annulé':
          case 'canceled': return '#ef4444';
          default: return '#64748b';
        }
      });

      const config: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels: statusLabels,
          datasets: [{
            label: 'Nombre de réservations',
            data: statusValues,
            backgroundColor: statusColors,
            borderColor: statusColors.map(color => this.adjustColor(color, -20)),
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: this.chartConfig.bar
      };

      this.chartByStatusInstance = new Chart(this.chartByStatus.nativeElement, config);
    }
  }

  private destroyCharts(): void {
    this.chartMonthlyCountInstance?.destroy();
    this.chartMonthlyRevenueInstance?.destroy();
    this.chartByTypeInstance?.destroy();
    this.chartByStatusInstance?.destroy();
  }

  private clearCharts(): void {
    this.destroyCharts();
    
    // Afficher un message d'erreur dans les charts
    const emptyMessage = 'Aucune donnée disponible';
    
    const emptyConfig: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: [''],
        datasets: [{
          label: emptyMessage,
          data: [0],
          backgroundColor: '#f1f5f9',
          borderColor: '#cbd5e1',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Données non disponibles',
            font: { size: 14 }
          }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    };
    
    // Appliquer aux canvas si disponibles
    const canvases = [
      { ref: this.chartMonthlyCount, type: 'line' },
      { ref: this.chartMonthlyRevenue, type: 'bar' },
      { ref: this.chartByType, type: 'doughnut' },
      { ref: this.chartByStatus, type: 'bar' }
    ];
    
    canvases.forEach(({ ref, type }) => {
      if (ref?.nativeElement) {
        if (type === 'line') {
          const lineConfig: ChartConfiguration<'line'> = {
            type: 'line',
            data: {
              labels: [''],
              datasets: [{
                label: emptyMessage,
                data: [0],
                borderColor: '#cbd5e1',
                backgroundColor: '#f1f5f9'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: {
                  display: true,
                  text: 'Données non disponibles',
                  font: { size: 14 }
                }
              },
              scales: {
                x: { display: false },
                y: { display: false }
              }
            }
          };
          new Chart(ref.nativeElement, lineConfig);
        } else if (type === 'doughnut') {
          const doughnutConfig: ChartConfiguration<'doughnut'> = {
            type: 'doughnut',
            data: {
              labels: ['Aucune donnée'],
              datasets: [{
                label: emptyMessage,
                data: [1],
                backgroundColor: ['#f1f5f9'],
                borderColor: ['#cbd5e1']
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: {
                  display: true,
                  text: 'Données non disponibles',
                  font: { size: 14 }
                }
              }
            }
          };
          new Chart(ref.nativeElement, doughnutConfig);
        } else {
          new Chart(ref.nativeElement, emptyConfig);
        }
      }
    });
  }

  // Helper Methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MRU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatMonth(monthStr: string): string {
    // Format: "2024-01" -> "Jan 2024"
    const [year, month] = monthStr.split('-');
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
                       'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  }

  getClientSince(client: TopClient): string {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
                   'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const randomMonth = months[Math.floor(Math.random() * months.length)];
    const currentYear = new Date().getFullYear();
    const randomYear = currentYear - Math.floor(Math.random() * 3);
    
    return `${randomMonth} ${randomYear}`;
  }

  private adjustColor(color: string, amount: number): string {
    // Simple color adjustment for border colors
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  // Private Helper Methods
  private initializeRouterListener(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAdminRoute();
        if (this.isAdminRoot) {
          this.loadKpis();
          if (this.viewReady) {
            this.reloadStats();
          }
        }
      });
  }

  private checkAdminRoute(): void {
    this.isAdminRoot = this.router.url === '/admin' || this.router.url === '/admin/';
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getFirstDayOfYear(): string {
    const year = new Date().getFullYear();
    return `${year}-01-01`;
  }
}