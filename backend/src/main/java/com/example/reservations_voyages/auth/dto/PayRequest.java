package com.example.reservations_voyages.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record PayRequest(
        @NotBlank String method // CARD, CASH, WALLET
) {}
