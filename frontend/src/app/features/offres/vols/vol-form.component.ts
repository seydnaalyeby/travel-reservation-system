import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VolService } from '../../../services/vol.service';
import { Vol } from '../../../models/vol.model';

type VolStatut = 'DISPONIBLE' | 'COMPLET' | 'ANNULE';

@Component({
  selector: 'app-vol-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './vol-form.component.html',
  styleUrls: ['./vol-form.component.scss']
})
export class VolFormComponent implements OnInit {
  volForm!: FormGroup;
  isEditMode = false;

  statuts: VolStatut[] = ['DISPONIBLE', 'COMPLET', 'ANNULE'];

  constructor(
    private fb: FormBuilder,
    private volService: VolService,
    private dialogRef: MatDialogRef<VolFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Vol | undefined,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data;
  }

  ngOnInit(): void {
    this.initForm();
    if (this.data) this.populateForm(this.data);

    // ✅ Auto-statut: si places=0 => COMPLET (sauf ANNULE)
    this.volForm.get('placesDisponibles')?.valueChanges.subscribe(() => this.autoStatut());
    this.volForm.get('statut')?.valueChanges.subscribe(() => this.autoStatut());

    // ✅ Revalider le formulaire quand dates/heures changent
    ['dateHeureDepart', 'heureDepart', 'dateHeureArrivee', 'heureArrivee', 'aeroportDepart', 'aeroportArrivee']
      .forEach(k => this.volForm.get(k)?.valueChanges.subscribe(() => this.volForm.updateValueAndValidity({ emitEvent: false })));
  }

  initForm(): void {
    this.volForm = this.fb.group({
      numeroVol: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]{2,15}$/)]],
      compagnie: ['', Validators.required],
      aeroportDepart: ['', Validators.required],
      aeroportArrivee: ['', Validators.required],

      // Date + time séparés
      dateHeureDepart: [null, Validators.required],
      heureDepart: ['00:00', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],

      dateHeureArrivee: [null, Validators.required],
      heureArrivee: ['00:00', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],

      placesDisponibles: [0, [Validators.required, Validators.min(0)]],
      prixBase: [0, [Validators.required, Validators.min(0.01)]],
      statut: ['DISPONIBLE' as VolStatut, Validators.required]
    }, { validators: [this.volLogicValidator] });
  }

  populateForm(vol: Vol): void {
    const dateDepart = new Date(vol.dateHeureDepart);
    const dateArrivee = new Date(vol.dateHeureArrivee);

    this.volForm.patchValue({
      numeroVol: vol.numeroVol,
      compagnie: vol.compagnie,
      aeroportDepart: vol.aeroportDepart,
      aeroportArrivee: vol.aeroportArrivee,
      dateHeureDepart: dateDepart,
      heureDepart: this.formatTime(dateDepart),
      dateHeureArrivee: dateArrivee,
      heureArrivee: this.formatTime(dateArrivee),
      placesDisponibles: vol.placesDisponibles,
      prixBase: vol.prixBase,
      statut: (vol.statut as VolStatut) || 'DISPONIBLE'
    });

    this.autoStatut();
  }

  // ✅ Validator global: aeroports différents + arrivée après départ
  private volLogicValidator = (group: AbstractControl): ValidationErrors | null => {
    const dep = (group.get('aeroportDepart')?.value || '').trim().toLowerCase();
    const arr = (group.get('aeroportArrivee')?.value || '').trim().toLowerCase();

    if (dep && arr && dep === arr) return { sameAirports: true };

    const depDate: Date | null = group.get('dateHeureDepart')?.value;
    const depTime: string = group.get('heureDepart')?.value;
    const arrDate: Date | null = group.get('dateHeureArrivee')?.value;
    const arrTime: string = group.get('heureArrivee')?.value;

    const depDT = this.buildDate(depDate, depTime);
    const arrDT = this.buildDate(arrDate, arrTime);

    if (depDT && arrDT && arrDT.getTime() <= depDT.getTime()) return { arrivalBeforeDeparture: true };

    return null;
  };

  private autoStatut(): void {
    const places = Number(this.volForm.get('placesDisponibles')?.value ?? 0);
    const statut: VolStatut = this.volForm.get('statut')?.value;

    if (statut === 'ANNULE') return;

    if (places <= 0 && statut !== 'COMPLET') {
      this.volForm.get('statut')?.setValue('COMPLET', { emitEvent: false });
    }
    if (places > 0 && statut === 'COMPLET') {
      this.volForm.get('statut')?.setValue('DISPONIBLE', { emitEvent: false });
    }
  }

  private formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  private buildDate(date: Date | null, time: string): Date | null {
    if (!date) return null;
    const [hh, mm] = time.split(':').map(Number);
    const d = new Date(date);
    d.setHours(hh, mm, 0, 0);
    return d;
  }

  // ✅ IMPORTANT: éviter toISOString() (UTC shift). On envoie LocalDateTime sans timezone.
  private toLocalDateTimeString(date: Date | null, time: string): string {
    const d = this.buildDate(date, time);
    if (!d) return '';
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}:00`;
  }

  onSubmit(): void {
    if (this.volForm.invalid) {
      this.volForm.markAllAsTouched();
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', { duration: 2500 });
      return;
    }

    const f = this.volForm.value;

    const vol: Vol = {
      numeroVol: String(f.numeroVol).trim().toUpperCase(),
      compagnie: String(f.compagnie).trim(),
      aeroportDepart: String(f.aeroportDepart).trim(),
      aeroportArrivee: String(f.aeroportArrivee).trim(),
      dateHeureDepart: this.toLocalDateTimeString(f.dateHeureDepart, f.heureDepart),
      dateHeureArrivee: this.toLocalDateTimeString(f.dateHeureArrivee, f.heureArrivee),
      placesDisponibles: Number(f.placesDisponibles),
      prixBase: Number(f.prixBase),
      statut: f.statut as VolStatut
    };

    if (this.isEditMode && this.data?.id) {
      this.volService.updateVol(this.data.id, vol).subscribe({
        next: () => {
          this.snackBar.open('Vol modifié avec succès', 'Fermer', { duration: 2500 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.snackBar.open(err?.error?.message || 'Erreur lors de la modification', 'Fermer', { duration: 3000 });
          console.error(err);
        }
      });
    } else {
      this.volService.createVol(vol).subscribe({
        next: () => {
          this.snackBar.open('Vol créé avec succès', 'Fermer', { duration: 2500 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.snackBar.open(err?.error?.message || 'Erreur lors de la création', 'Fermer', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
