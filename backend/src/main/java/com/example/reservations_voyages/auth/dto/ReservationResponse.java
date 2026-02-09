package com.example.reservations_voyages.auth.dto;

import com.example.reservations_voyages.user.entity.ReservationStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservationResponse(
        Long id,
        String type,                 // "VOL" ou "HOTEL"
        ReservationStatus status,
        BigDecimal totalPrice,
        LocalDateTime createdAt,

        // VOL
        Long volId,
        String volInfo,
        Integer nbPlaces,
        Long volRetourId,
        String volRetourInfo,

        // HOTEL
        Long hotelId,
        String hotelName,
        LocalDate checkIn,
        LocalDate checkOut,
        Integer rooms
) {}
