package com.example.reservations_voyages.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String reference; // ex: PAY-2026-0001

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    // mock method : CARD / CASH / WALLET
    @Column(nullable = false)
    private String method;

    // Pour tracer qui paye
    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id")
    private User client;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (reference == null) reference = "PAY-" + System.currentTimeMillis();
    }
}

