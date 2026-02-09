package com.example.reservations_voyages.auth.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MonthPoint {
    private String month;        // "2026-02"
    private long count;          // nb reservations
    private BigDecimal revenue;  // CA confirmé du mois
}
