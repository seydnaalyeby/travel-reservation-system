package com.example.reservations_voyages.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservation_vols")
@Getter @Setter
public class ReservationVol {

    @OneToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // client qui réserve
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private User client;

    // vol ALLER (obligatoire)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "vol_id")
    private Vol vol;

    // vol RETOUR (optionnel)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vol_retour_id")
    private Vol volRetour;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripType tripType = TripType.ONE_WAY;

    @Column(nullable = false)
    private int nbPlaces;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.PENDING_PAYMENT;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
