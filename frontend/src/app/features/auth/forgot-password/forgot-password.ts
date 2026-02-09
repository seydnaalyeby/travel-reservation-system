import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = false;
  message: string | null = null;
  error: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit() {
    this.message = null;
    this.error = null;

    if (this.form.invalid) return;

    this.loading = true;
    const email = this.form.getRawValue().email!;

    this.auth.forgotPassword(email).subscribe({
      next: (res) => (this.message = res.message),
      error: () => (this.message = 'If the email exists, reset instructions were sent.'),
      complete: () => (this.loading = false),
    });
  }
}
