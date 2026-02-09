package com.example.reservations_voyages.auth.controller;

import com.example.reservations_voyages.auth.dto.PayRequest;
import com.example.reservations_voyages.auth.dto.PaymentResponse;
import com.example.reservations_voyages.auth.service.PaymentService;
import com.example.reservations_voyages.user.entity.Payment;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/client/payments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENT')")

public class ClientPaymentController {

    private final PaymentService paymentService;

    @PostMapping("/vol/{reservationId}")
    public PaymentResponse payVol(@PathVariable Long reservationId,
                                  @Valid @RequestBody PayRequest req,
                                  Authentication auth) {

        Payment p = paymentService.payForVol(auth.getName(), reservationId, req);

        return new PaymentResponse(
                p.getId(),
                p.getReference(),
                p.getAmount(),
                p.getStatus().name(),
                p.getMethod(),
                p.getCreatedAt()
        );
    }

    @PostMapping("/hotel/{reservationId}")
    public PaymentResponse payHotel(@PathVariable Long reservationId,
                                    @Valid @RequestBody PayRequest req,
                                    Authentication auth) {

        Payment p = paymentService.payForHotel(auth.getName(), reservationId, req);

        return new PaymentResponse(
                p.getId(),
                p.getReference(),
                p.getAmount(),
                p.getStatus().name(),
                p.getMethod(),
                p.getCreatedAt()
        );
    }
}
