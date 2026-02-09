package com.example.reservations_voyages.auth.controller;

import com.example.reservations_voyages.auth.dto.ReservationResponse;
import com.example.reservations_voyages.auth.dto.ReserveHotelRequest;
import com.example.reservations_voyages.auth.dto.ReserveVolRequest;
import com.example.reservations_voyages.auth.service.ClientReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client/reservations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENT')")
public class ClientReservationController {

    private final ClientReservationService service;

    @PostMapping("/vols")
    public ReservationResponse reserveVol(@Valid @RequestBody ReserveVolRequest req,
                                          Authentication auth) {
        return service.reserveVol(auth.getName(), req); // auth.getName() = email
    }

    @PostMapping("/hotels")
    public ReservationResponse reserveHotel(@Valid @RequestBody ReserveHotelRequest req,
                                            Authentication auth) {
        return service.reserveHotel(auth.getName(), req);
    }

    @GetMapping
    public List<ReservationResponse> myReservations(Authentication auth) {
        return service.myReservations(auth.getName());
    }
    // ✅ ANNULATION VOL
    @PatchMapping("/vol/{id}/cancel")
    public void cancelVol(@PathVariable Long id, Authentication auth) {
        service.cancelVol(auth.getName(), id);
    }

    // ✅ ANNULATION HOTEL
    @PatchMapping("/hotel/{id}/cancel")
    public void cancelHotel(@PathVariable Long id, Authentication auth) {
        service.cancelHotel(auth.getName(), id);
    }

}

