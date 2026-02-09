import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from '../../../core/auth/token-storage';

import { ClientVolsComponent } from '../client-vols/client-vols.component';
import { ClientHotelsComponent } from '../client-hotels/client-hotels.component';
import { ClientReservationsComponent } from '../client-reservations/client-reservations.component';

type TabKey = 'vols' | 'hotels' | 'reservations';

@Component({
  standalone: true,
  selector: 'app-client-home',
  imports: [CommonModule, ClientVolsComponent, ClientHotelsComponent, ClientReservationsComponent],
  templateUrl: './client-home.html',
  styleUrls: ['./client-home.scss']
})
export class ClientHomeComponent implements OnInit {
  user: { userId: number; fullName: string; email: string } | null = null;
  activeTab: TabKey = 'reservations';

  constructor(
    private storage: TokenStorageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.user = this.storage.getUser();

    // si tu viens de PaymentPage => /client?tab=reservations
    const tab = this.route.snapshot.queryParamMap.get('tab') as TabKey | null;
    if (tab === 'vols' || tab === 'hotels' || tab === 'reservations') {
      this.activeTab = tab;
    }
  }

  setTab(tab: TabKey) {
    this.activeTab = tab;
    this.router.navigate(['/client'], { queryParams: { tab } });
  }

  logout(): void {
    this.storage.clear();
    this.router.navigateByUrl('/login');
  }
}
