export interface Hotel {
  id?: number;
  nom: string;
  adresse: string;
  ville: string;
  pays: string;
  etoiles: number;
  prixParNuit: number;

  chambresTotales: number;
  chambresDisponibles: number; // ✅ AJOUT (compat Spring)

  description?: string;
  equipements: string[];
}





