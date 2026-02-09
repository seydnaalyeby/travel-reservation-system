package com.example.reservations_voyages.auth.controller;

import com.example.reservations_voyages.user.entity.Hotel;
import com.example.reservations_voyages.user.entity.Vol;
import com.example.reservations_voyages.user.repo.HotelRepository;
import com.example.reservations_voyages.user.repo.VolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENT')")
public class ClientSearchController {

    private final VolRepository volRepository;
    private final HotelRepository hotelRepository;

    @GetMapping("/vols")
    public List<Vol> vols() {
        return volRepository.findAll();
    }

    @GetMapping("/hotels")
    public List<Hotel> hotels() {
        return hotelRepository.findAll();
    }
}

