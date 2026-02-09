export interface Vol {
  id?: number;
  numeroVol: string;
  compagnie: string;
  aeroportDepart: string;
  aeroportArrivee: string;
  dateHeureDepart: string; // ISO string format
  dateHeureArrivee: string; // ISO string format
  placesDisponibles: number;
  prixBase: number;
  statut: 'DISPONIBLE' | 'COMPLET' | 'ANNULE';
}

export type VolStatut = 'DISPONIBLE' | 'COMPLET' | 'ANNULE';




