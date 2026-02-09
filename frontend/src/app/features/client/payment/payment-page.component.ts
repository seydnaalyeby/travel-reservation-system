import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormGroup
} from '@angular/forms';

import { PaymentService } from '../../../services/payment.service';
import { PayRequest, PaymentMethod } from '../../../models/payment.model';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.scss']
})
export class PaymentPageComponent {
  type: 'VOL' | 'HOTEL' = 'VOL';
  reservationId = 0;

  msg = '';
  msgOk = false;
  processing = false;

  // ✅ Form typé (plus d'erreur "string not assignable")
  form: FormGroup<{
    method: FormControl<PaymentMethod>;
  }>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private payment: PaymentService
  ) {
    const t = (this.route.snapshot.paramMap.get('type') || 'VOL').toUpperCase();
    this.type = t === 'HOTEL' ? 'HOTEL' : 'VOL';
    this.reservationId = Number(this.route.snapshot.paramMap.get('id') || 0);

    this.form = this.fb.group({
      method: new FormControl<PaymentMethod>('CARD', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  pay() {
    if (this.form.invalid || this.processing) return;

    this.msg = '';
    this.msgOk = false;
    this.processing = true;

    const req: PayRequest = {
      method: this.form.getRawValue().method,
      success: true,
    };

    const call$ = this.type === 'VOL'
      ? this.payment.payVol(this.reservationId, req)
      : this.payment.payHotel(this.reservationId, req);

    call$.subscribe({
      next: (p: any) => {
        this.msgOk = p?.status === 'PAID';
        this.msg = this.msgOk ? '✅ Paiement effectué avec succès' : '❌ Paiement échoué';
        this.processing = false;
        setTimeout(() => {
          this.router.navigate(['/client'], { queryParams: { tab: 'reservations' } });
        }, 2000);
      },
      error: (err) => {
        this.msgOk = false;
        this.msg = err?.error?.message || 'Erreur lors du paiement';
        this.processing = false;
      }
    });
  }

  back() {
    this.router.navigate(['/client'], { queryParams: { tab: 'reservations' } });
  }
}
