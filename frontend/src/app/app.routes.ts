import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';

import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard';

import { ClientHomeComponent } from './features/client/client-home/client-home';
import { PaymentPageComponent } from './features/client/payment/payment-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // ✅ CLIENT : page unique avec onglets
  {
    path: 'client',
    component: ClientHomeComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'CLIENT' }
  },

  // ✅ PAGE PAIEMENT séparée
  {
    path: 'client/pay/:type/:id',
    component: PaymentPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'CLIENT' }
  },

  // ✅ ADMIN
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    children: [
      // { path: '', redirectTo: 'vols', pathMatch: 'full' },
      {
  path: 'reservations',
  loadComponent: () =>
    import('./features/reservations/reservations/reservations')
      .then(m => m.ReservationsComponent),
 
},
      {
        path: 'vols',
        loadComponent: () =>
          import('./features/offres/vols/vol-list.component').then(m => m.VolListComponent)
      },
      {
        path: 'hotels',
        loadComponent: () =>
          import('./features/offres/hotels/hotel-list.component').then(m => m.HotelListComponent)
      },
       { path: 'users', loadComponent: () => import('./features/admin/users/user-list/user-list').then(m => m.UserListComponent) },
    { path: 'users/new', loadComponent: () => import('./features/admin/users/user-form/user-form').then(m => m.UserFormComponent) },
    { path: 'users/:id/edit', loadComponent: () => import('./features/admin/users/user-form/user-form').then(m => m.UserFormComponent) },

    ]
  },

  { path: '**', redirectTo: 'login' }
];
