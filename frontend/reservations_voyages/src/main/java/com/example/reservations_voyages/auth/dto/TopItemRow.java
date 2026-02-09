package com.example.reservations_voyages.auth.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TopItemRow {
    private Long itemId;     // vol_id ou hotel_id
    private String label;    // numero vol / nom hotel (si dispo)
    private long count;      // nb reservations
}
