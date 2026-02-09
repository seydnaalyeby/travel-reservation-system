package com.example.reservations_voyages.auth.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LabelValue {
    private String label; // "VOL", "HOTEL", "CONFIRMED", ...
    private long value;
}
