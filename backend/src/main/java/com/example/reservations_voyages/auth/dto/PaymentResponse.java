package com.example.reservations_voyages.auth.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        String reference,
        BigDecimal amount,
        String status,
        String method,
        LocalDateTime createdAt
) {}

