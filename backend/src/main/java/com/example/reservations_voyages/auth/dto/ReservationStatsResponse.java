package com.example.reservations_voyages.auth.dto;


import com.example.reservations_voyages.user.entity.ReservationStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ReservationStatsResponse {

    private long total;
    private long vols;
    private long hotels;

    private Map<ReservationStatus, Long> byStatus; // PENDING/CONFIRMED/CANCELED
    private BigDecimal revenueConfirmed;           // somme totalPrice (CONFIRMED)

    private List<MonthPoint> monthly;            // série par mois (count + revenue)
}

