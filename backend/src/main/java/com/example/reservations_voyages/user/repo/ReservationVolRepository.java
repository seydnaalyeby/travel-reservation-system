package com.example.reservations_voyages.user.repo;

import com.example.reservations_voyages.user.entity.ReservationVol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationVolRepository extends JpaRepository<ReservationVol, Long> {
    List<ReservationVol> findByClientIdOrderByCreatedAtDesc(Long clientId);
    Optional<ReservationVol> findByIdAndClientId(Long id, Long clientId);

}

