package com.example.reservations_voyages.auth.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TopClientRow {
    private Long clientId;
    private String clientName;
    private String clientEmail;
    private long reservationsCount;
    private BigDecimal revenueConfirmed;
}
