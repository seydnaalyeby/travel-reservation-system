package com.example.reservations_voyages.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hotels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom de l'hôtel est obligatoire")
    @Column(nullable = false)
    private String nom;

    @NotBlank(message = "L'adresse est obligatoire")
    @Column(nullable = false)
    private String adresse;

    @NotBlank(message = "La ville est obligatoire")
    @Column(nullable = false)
    private String ville;

    @NotBlank(message = "Le pays est obligatoire")
    @Column(nullable = false)
    private String pays;

    @Min(value = 1, message = "Le nombre d'étoiles doit être entre 1 et 5")
    @Max(value = 5, message = "Le nombre d'étoiles doit être entre 1 et 5")
    @Column(nullable = false)
    private int etoiles;

    @NotNull(message = "Le prix par nuit est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix par nuit doit être strictement positif")
    @Digits(integer = 10, fraction = 2, message = "Le prix doit avoir au maximum 10 chiffres entiers et 2 décimales")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal prixParNuit;

    @Min(value = 1, message = "Le nombre de chambres totales doit être au moins 1")
    @Column(nullable = false)
    private int chambresTotales;

    // ✅ NOUVEAU : stock de chambres disponibles (comme placesDisponibles sur Vol)
    @Min(value = 0, message = "Le nombre de chambres disponibles doit être >= 0")
    @Column(nullable = false)
    private int chambresDisponibles;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "hotel_equipements", joinColumns = @JoinColumn(name = "hotel_id"))
    @Column(name = "equipement")
    @Builder.Default
    private List<String> equipements = new ArrayList<>();
}
