package com.example.reservations_voyages.auth.controller;

import com.example.reservations_voyages.user.entity.Vol;
import com.example.reservations_voyages.auth.service.VolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vols")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class VolController {

    private final VolService volService;

    @GetMapping
    public ResponseEntity<List<Vol>> getAllVols() {
        List<Vol> vols = volService.getAllVols();
        return ResponseEntity.ok(vols);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vol> getVolById(@PathVariable Long id) {
        Vol vol = volService.getVolById(id);
        return ResponseEntity.ok(vol);
    }

    @PostMapping
    public ResponseEntity<Vol> createVol(@Valid @RequestBody Vol vol) {
        Vol createdVol = volService.createVol(vol);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdVol);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vol> updateVol(@PathVariable Long id, @Valid @RequestBody Vol vol) {
        Vol updatedVol = volService.updateVol(id, vol);
        return ResponseEntity.ok(updatedVol);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVol(@PathVariable Long id) {
        volService.deleteVol(id);
        return ResponseEntity.noContent().build();
    }
}



