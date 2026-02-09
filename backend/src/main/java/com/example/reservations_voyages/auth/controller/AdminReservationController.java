package com.example.reservations_voyages.auth.controller;

import com.example.reservations_voyages.auth.dto.AdminReservationRow;
import com.example.reservations_voyages.auth.service.AdminReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reservations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReservationController {

    private final AdminReservationService service;

    // ✅ LISTE
    @GetMapping
    public List<AdminReservationRow> all() {
        return service.all();
    }

    // ✅ ANNULER
    @PatchMapping("/vol/{id}/cancel")
    public void cancelVol(@PathVariable Long id) {
        service.cancelVol(id);
    }

    @PatchMapping("/hotel/{id}/cancel")
    public void cancelHotel(@PathVariable Long id) {
        service.cancelHotel(id);
    }

    // ✅ SUPPRIMER
    @DeleteMapping("/vol/{id}")
    public void deleteVol(@PathVariable Long id) {
        service.deleteVol(id);
    }

    @DeleteMapping("/hotel/{id}")
    public void deleteHotel(@PathVariable Long id) {
        service.deleteHotel(id);
    }
}
