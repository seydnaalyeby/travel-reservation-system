package com.example.reservations_voyages.auth.controller;

import com.example.reservations_voyages.auth.dto.AdminReservationStatsResponse;
import com.example.reservations_voyages.auth.service.AdminReservationStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReservationStatsController {

    private final AdminReservationStatsService service;

    // مثال: /api/admin/stats/reservations?from=2026-01-01&to=2026-12-31
    @GetMapping("/reservations")
    public AdminReservationStatsResponse reservations(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {
        return service.stats(from, to);
    }
}
