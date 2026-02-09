package com.example.reservations_voyages.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vols", uniqueConstraints = {
        @UniqueConstraint(columnNames = "numeroVol")
})
@Data                   // ← remplace @Getter + @Setter + @ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le numéro de vol est obligatoire")
    @Column(nullable = false, unique = true)
    private String numeroVol;

    @NotBlank(message = "La compagnie est obligatoire")
    @Column(nullable = false)
    private String compagnie;

    @NotBlank(message = "L'aéroport de départ est obligatoire")
    @Column(nullable = false)
    private String aeroportDepart;

    @NotBlank(message = "L'aéroport d'arrivée est obligatoire")
    @Column(nullable = false)
    private String aeroportArrivee;

    @NotNull(message = "La date et heure de départ sont obligatoires")
    @Column(nullable = false)
    private LocalDateTime dateHeureDepart;

    @NotNull(message = "La date et heure d'arrivée sont obligatoires")
    @Column(nullable = false)
    private LocalDateTime dateHeureArrivee;

    @Min(value = 0, message = "Le nombre de places disponibles doit être positif ou nul")
    @Column(nullable = false)
    private int placesDisponibles;

    @NotNull(message = "Le prix de base est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix de base doit être strictement positif")
    @Digits(integer = 10, fraction = 2, message = "Le prix doit avoir au maximum 10 chiffres entiers et 2 décimales")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal prixBase;

    @NotBlank(message = "Le statut est obligatoire")
    @Pattern(regexp = "DISPONIBLE|COMPLET|ANNULE",
            message = "Le statut doit être DISPONIBLE, COMPLET ou ANNULE")
    @Column(nullable = false)
    private String statut;
}


