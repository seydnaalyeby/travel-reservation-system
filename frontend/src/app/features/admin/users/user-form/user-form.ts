import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

import { AdminUsersService } from '../../../../services/user.service';
import { Role, UserCreateRequest, UserUpdateRequest } from '../../../../core/auth/auth.models';

type DialogData = { mode: 'create' | 'edit'; id?: number };

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDialogModule
  ],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.scss']
})
export class UserFormComponent implements OnInit {
  form!: FormGroup;
  roles: Role[] = ['ADMIN', 'CLIENT'];
  isEdit = false;
  userId?: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: AdminUsersService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['CLIENT' as Role, Validators.required],
      password: [''],
      enabled: [true]
    });

    this.isEdit = this.data?.mode === 'edit';
    this.userId = this.data?.id;

    if (this.isEdit && this.userId != null) {
      this.loading = true;
      this.api.get(this.userId).subscribe({
        next: (u) => {
          this.form.patchValue({
            fullName: u.fullName,
            email: u.email,
            role: u.role,
            enabled: u.enabled
          });
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snack.open('Utilisateur introuvable', 'OK', { duration: 2000 });
          this.dialogRef.close({ refresh: false });
        }
      });
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const v = this.form.value;

    if (this.isEdit) {
      const req: UserUpdateRequest = {
        fullName: v.fullName!,
        email: v.email!,
        role: v.role!,
        enabled: v.enabled!,
        ...(v.password ? { password: v.password } : {})
      };

      this.api.update(this.userId!, req).subscribe({
        next: () => {
          this.snack.open('Utilisateur modifié', 'OK', { duration: 2000 });
          this.dialogRef.close({ refresh: true });
        },
        error: () => {
          this.loading = false;
          this.snack.open('Erreur modification', 'OK', { duration: 2000 });
        }
      });

    } else {
      const req: UserCreateRequest = {
        fullName: v.fullName!,
        email: v.email!,
        password: v.password!,
        role: v.role!,
        enabled: v.enabled!
      };

      this.api.create(req).subscribe({
        next: () => {
          this.snack.open('Utilisateur créé', 'OK', { duration: 2000 });
          this.dialogRef.close({ refresh: true });
        },
        error: () => {
          this.loading = false;
          this.snack.open('Erreur création', 'OK', { duration: 2000 });
        }
      });
    }
  }

  cancel() {
    this.dialogRef.close({ refresh: false });
  }
}
