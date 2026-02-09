package com.example.reservations_voyages.user.repo;

import com.example.reservations_voyages.user.entity.ReservationHotel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReservationHotelRepository extends JpaRepository<ReservationHotel, Long> {
    List<ReservationHotel> findByClientIdOrderByCreatedAtDesc(Long clientId);
    Optional<ReservationHotel> findByIdAndClientId(Long id, Long clientId);
}



