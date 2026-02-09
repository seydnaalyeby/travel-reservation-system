import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
    private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  loading = false;
  error: string | null = null;

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  

  submit() {
    this.error = null;
    if (this.form.invalid) return;

    this.loading = true;
    this.auth.register(this.form.getRawValue() as any).subscribe({
      next: (res) => {
        this.router.navigateByUrl(res.role === 'ADMIN' ? '/admin' : '/client');
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'Register failed';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
}
