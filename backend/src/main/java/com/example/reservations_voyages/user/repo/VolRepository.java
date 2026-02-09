package com.example.reservations_voyages.user.repo;

import com.example.reservations_voyages.user.entity.Vol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VolRepository extends JpaRepository<Vol, Long> {

    Optional<Vol> findByNumeroVol(String numeroVol);

    boolean existsByNumeroVol(String numeroVol);
}





