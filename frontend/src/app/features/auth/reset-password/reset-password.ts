import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
   styleUrls: ['./reset-password.scss']
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = false;
  message: string | null = null;
  error: string | null = null;

  token = this.route.snapshot.queryParamMap.get('token') || '';

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    this.message = null;
    this.error = null;

    if (!this.token) {
      this.error = 'Missing token in URL';
      return;
    }
    if (this.form.invalid) return;

    this.loading = true;
    const { newPassword, confirmPassword } = this.form.getRawValue();

    this.auth.resetPassword({
      token: this.token,
      newPassword: newPassword!,
      confirmPassword: confirmPassword!,
    }).subscribe({
      next: (res) => {
        this.message = res.message;
        setTimeout(() => this.router.navigateByUrl('/login'), 800);
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'Reset failed';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
}
