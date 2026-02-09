package com.example.reservations_voyages.user.repo;

import com.example.reservations_voyages.user.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {}

