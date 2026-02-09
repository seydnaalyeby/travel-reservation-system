import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';
import { TokenStorageService } from '../../../core/auth/token-storage';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
 styleUrls: ['./login.scss']
})
export class LoginComponent {
[x: string]: any;

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private storage = inject(TokenStorageService);
  private router = inject(Router);
  loading = false;
  error: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  
  submit() {
    this.error = null;
    if (this.form.invalid) return;

    this.loading = true;
    this.auth.login(this.form.getRawValue() as any).subscribe({
      next: (res) => {
        // redirect selon role
        this.router.navigateByUrl(res.role === 'ADMIN' ? '/admin' : '/client');
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'Login failed';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
}
