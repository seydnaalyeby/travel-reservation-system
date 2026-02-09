package com.example.reservations_voyages.auth.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ReserveHotelRequest(
        @NotNull Long hotelId,
        @NotNull LocalDate checkIn,
        @NotNull LocalDate checkOut,
        @Min(1) int rooms
) {}
