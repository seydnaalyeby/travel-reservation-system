import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';

import { HotelService } from '../../../services/hotel.service';
import { Hotel } from '../../../models/hotel.model';

@Component({
  selector: 'app-hotel-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule, // ✅ FIX: matTooltip utilisé dans le HTML
  ],
  templateUrl: './hotel-form.component.html',
  styleUrls: ['./hotel-form.component.scss']
})
export class HotelFormComponent implements OnInit {
  hotelForm!: FormGroup;
  isEditMode = false;
  saving = false;

  get equipementsArray(): FormArray {
    return this.hotelForm.get('equipements') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private dialogRef: MatDialogRef<HotelFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Hotel | undefined,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data;
  }

  ngOnInit(): void {
    this.initForm();
    if (this.data) this.populateForm(this.data);
  }

  private initForm(): void {
    this.hotelForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      adresse: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(160)]],
      ville: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      pays: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      etoiles: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      prixParNuit: [0, [Validators.required, Validators.min(0.01)]],
      chambresTotales: [1, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.maxLength(600)]],
      equipements: this.fb.array([])
    });
  }

  private populateForm(hotel: Hotel): void {
    const equipementsArray = this.fb.array(
      (hotel.equipements || []).map(eq => this.fb.control(eq))
    );

    this.hotelForm.patchValue({
      nom: hotel.nom,
      adresse: hotel.adresse,
      ville: hotel.ville,
      pays: hotel.pays,
      etoiles: hotel.etoiles,
      prixParNuit: hotel.prixParNuit,
      chambresTotales: hotel.chambresTotales,
      description: hotel.description || ''
    });

    this.hotelForm.setControl('equipements', equipementsArray);
  }

  addEquipement(raw: string): void {
    const value = (raw || '').trim();
    if (!value) return;

    // ✅ éviter doublons (case-insensitive)
    const exists = this.equipementsArray.controls.some(c =>
      String(c.value || '').trim().toLowerCase() === value.toLowerCase()
    );
    if (exists) {
      this.snackBar.open('Cet équipement est déjà ajouté', 'Fermer', { duration: 2200 });
      return;
    }

    this.equipementsArray.push(this.fb.control(value));
  }

  removeEquipement(index: number): void {
    this.equipementsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.saving) return;

    if (this.hotelForm.invalid) {
      this.hotelForm.markAllAsTouched();
      this.snackBar.open('Veuillez corriger les champs en rouge', 'Fermer', { duration: 2500 });
      return;
    }

    this.saving = true;

    const v = this.hotelForm.value;
    const chambresTotales: number = Number(v.chambresTotales ?? 0);

    const hotel: Hotel = {
      ...(this.data?.id ? { id: this.data.id } : {}),
      nom: (v.nom || '').trim(),
      adresse: (v.adresse || '').trim(),
      ville: (v.ville || '').trim(),
      pays: (v.pays || '').trim(),
      etoiles: Number(v.etoiles),
      prixParNuit: Number(v.prixParNuit),
      chambresTotales,
      chambresDisponibles: this.isEditMode
        ? (this.data as any)?.chambresDisponibles ?? chambresTotales
        : chambresTotales,
      description: (v.description || '').trim(),
      equipements: this.equipementsArray.controls.map(c => String(c.value || '').trim()).filter(Boolean),
    } as any;

    const req$ = (this.isEditMode && this.data?.id)
      ? this.hotelService.updateHotel(this.data.id, hotel)
      : this.hotelService.createHotel(hotel);

    req$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Hôtel modifié avec succès' : 'Hôtel créé avec succès',
          'Fermer',
          { duration: 2500 }
        );
        this.dialogRef.close(true);
        this.saving = false;
      },
      error: (err: HttpErrorResponse) => {
        const msg = err?.error?.message || 'Erreur serveur';
        this.snackBar.open(`Erreur: ${msg}`, 'Fermer', { duration: 3500 });
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    if (this.saving) return;
    this.dialogRef.close(false);
  }
}
