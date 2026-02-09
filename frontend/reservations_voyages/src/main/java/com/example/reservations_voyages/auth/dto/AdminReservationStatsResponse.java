package com.example.reservations_voyages.auth.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AdminReservationStatsResponse {

    // cards globales
    private long totalCount;
    private long volCount;
    private long hotelCount;

    private long pendingCount;
    private long confirmedCount;
    private long canceledCount;

    private double cancelRatePercent; // canceled / total * 100

    // CA (on prend généralement CONFIRMED seulement)
    private BigDecimal revenueConfirmedTotal;

    // séries pour graphes
    private List<MonthPoint> monthly;           // graphe count + CA
    private List<LabelValue> byType;            // VOL vs HOTEL
    private List<LabelValue> byStatus;          // PENDING/CONFIRMED/CANCELED

    // tops
    private List<TopClientRow> topClients;      // top 5 clients
    private List<TopItemRow> topVols;           // top vols
    private List<TopItemRow> topHotels;         // top hotels
}
