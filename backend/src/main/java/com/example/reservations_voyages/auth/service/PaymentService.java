package com.example.reservations_voyages.auth.service;

import com.example.reservations_voyages.common.exception.BadRequestException;
import com.example.reservations_voyages.common.exception.ResourceNotFoundException;
import com.example.reservations_voyages.auth.dto.PayRequest;
import com.example.reservations_voyages.user.entity.*;
import com.example.reservations_voyages.user.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final ReservationVolRepository reservationVolRepository;
    private final ReservationHotelRepository reservationHotelRepository;

    public Payment payForVol(String email, Long reservationId, PayRequest req) {
        User client = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));

        ReservationVol r = reservationVolRepository.findByIdAndClientId(reservationId, client.getId())
                .orElseThrow(() -> new ResourceNotFoundException("ReservationVol", reservationId));

        // ❌ Interdit si annulée
        if (r.getStatus() == ReservationStatus.CANCELED)
            throw new BadRequestException("Réservation annulée, paiement impossible");

        // ✅ Recommandé: paiement seulement si PENDING_PAYMENT
        if (r.getStatus() != ReservationStatus.PENDING_PAYMENT)
            throw new BadRequestException("Paiement possible uniquement pour une réservation en attente (PENDING_PAYMENT)");

        // ❌ Interdit si déjà payé
        if (r.getPayment() != null && r.getPayment().getStatus() == PaymentStatus.PAID)
            throw new BadRequestException("Déjà payé");

        Payment p = Payment.builder()
                .client(client)
                .amount(r.getTotalPrice())
                .method(req.method())
                .status(PaymentStatus.PAID)

                .build();

        p = paymentRepository.save(p);

        // ✅ si payé → confirmer la réservation
        if (p.getStatus() == PaymentStatus.PAID) {
            r.setStatus(ReservationStatus.CONFIRMED);
        }

        r.setPayment(p);
        reservationVolRepository.save(r);

        return p;
    }

    public Payment payForHotel(String email, Long reservationId, PayRequest req) {
        User client = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));

        ReservationHotel r = reservationHotelRepository.findByIdAndClientId(reservationId, client.getId())
                .orElseThrow(() -> new ResourceNotFoundException("ReservationHotel", reservationId));

        // ❌ Interdit si annulée
        if (r.getStatus() == ReservationStatus.CANCELED)
            throw new BadRequestException("Réservation annulée, paiement impossible");

        // ✅ Recommandé: paiement seulement si PENDING_PAYMENT
        if (r.getStatus() != ReservationStatus.PENDING_PAYMENT)
            throw new BadRequestException("Paiement possible uniquement pour une réservation en attente (PENDING_PAYMENT)");

        // ❌ Interdit si déjà payé
        if (r.getPayment() != null && r.getPayment().getStatus() == PaymentStatus.PAID)
            throw new BadRequestException("Déjà payé");

        Payment p = Payment.builder()
                .client(client)
                .amount(r.getTotalPrice())
                .method(req.method())
                .status(PaymentStatus.PAID)

                .build();

        p = paymentRepository.save(p);

        // ✅ si payé → confirmer la réservation
        if (p.getStatus() == PaymentStatus.PAID) {
            r.setStatus(ReservationStatus.CONFIRMED);
        }

        r.setPayment(p);
        reservationHotelRepository.save(r);

        return p;
    }
}
