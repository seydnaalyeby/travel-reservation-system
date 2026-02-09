package com.example.reservations_voyages.auth.dto;

import com.example.reservations_voyages.user.entity.ReservationStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AdminReservationRow {
    private String ref;              // "VOL-12" ou "HOTEL-7"
    private Long id;
    private String clientName;
    private String clientEmail;
    private String type;             // "VOL" | "HOTEL"
    private LocalDateTime createdAt;
    private BigDecimal amount;
    private ReservationStatus status;
}
