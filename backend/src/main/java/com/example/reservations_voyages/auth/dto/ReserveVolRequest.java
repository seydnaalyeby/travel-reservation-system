package com.example.reservations_voyages.auth.dto;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReserveVolRequest(
        @NotNull Long volId,      // ALLER
        Long volRetourId,         // RETOUR (nullable)
        @Min(1) int nbPlaces
) {}
