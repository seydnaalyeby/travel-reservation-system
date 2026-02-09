package com.example.reservations_voyages.auth.service;

import com.example.reservations_voyages.auth.dto.AdminReservationRow;
import com.example.reservations_voyages.common.exception.BadRequestException;
import com.example.reservations_voyages.common.exception.ResourceNotFoundException;
import com.example.reservations_voyages.user.entity.*;
import com.example.reservations_voyages.user.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminReservationService {

    private final ReservationVolRepository reservationVolRepository;
    private final ReservationHotelRepository reservationHotelRepository;
    private final VolRepository volRepository;
    private final HotelRepository hotelRepository;

    // ===================== LIST ALL (VOL + HOTEL) =====================
    @Transactional(readOnly = true)
    public List<AdminReservationRow> all() {
        var vols = reservationVolRepository.findAll();
        var hotels = reservationHotelRepository.findAll();

        return Stream.concat(
                        vols.stream().map(this::mapVol),
                        hotels.stream().map(this::mapHotel)
                )
                .sorted(Comparator.comparing(AdminReservationRow::getCreatedAt).reversed())
                .toList();
    }

    private AdminReservationRow mapVol(ReservationVol r) {
        return AdminReservationRow.builder()
                .ref("VOL-" + r.getId())
                .id(r.getId())
                .type("VOL")
                .clientName(r.getClient().getFullName())
                .clientEmail(r.getClient().getEmail())
                .createdAt(r.getCreatedAt())
                .amount(r.getTotalPrice())
                .status(r.getStatus())
                .build();
    }

    private AdminReservationRow mapHotel(ReservationHotel r) {
        return AdminReservationRow.builder()
                .ref("HOTEL-" + r.getId())
                .id(r.getId())
                .type("HOTEL")
                .clientName(r.getClient().getFullName())
                .clientEmail(r.getClient().getEmail())
                .createdAt(r.getCreatedAt())
                .amount(r.getTotalPrice())
                .status(r.getStatus())
                .build();
    }

    // ===================== CANCEL VOL (ADMIN) =====================
    public void cancelVol(Long reservationId) {
        ReservationVol r = reservationVolRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("ReservationVol", reservationId));

        if (r.getStatus() == ReservationStatus.CANCELED) {
            throw new BadRequestException("Réservation vol déjà annulée");
        }
        if (r.getStatus() == ReservationStatus.CONFIRMED) {
            throw new BadRequestException("Impossible d'annuler une réservation payée (CONFIRMED)");
        }

        Vol aller = r.getVol();
        aller.setPlacesDisponibles(aller.getPlacesDisponibles() + r.getNbPlaces());
        volRepository.save(aller);

        if (r.getVolRetour() != null) {
            Vol retour = r.getVolRetour();
            retour.setPlacesDisponibles(retour.getPlacesDisponibles() + r.getNbPlaces());
            volRepository.save(retour);
        }

        r.setStatus(ReservationStatus.CANCELED);
        reservationVolRepository.save(r);
    }

    // ===================== CANCEL HOTEL (ADMIN) =====================
    public void cancelHotel(Long reservationId) {
        ReservationHotel r = reservationHotelRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("ReservationHotel", reservationId));

        if (r.getStatus() == ReservationStatus.CANCELED) {
            throw new BadRequestException("Réservation hôtel déjà annulée");
        }
        if (r.getStatus() == ReservationStatus.CONFIRMED) {
            throw new BadRequestException("Impossible d'annuler une réservation payée (CONFIRMED)");
        }

        Hotel h = r.getHotel();
        h.setChambresDisponibles(h.getChambresDisponibles() + r.getRooms());
        hotelRepository.save(h);

        r.setStatus(ReservationStatus.CANCELED);
        reservationHotelRepository.save(r);
    }

    // ===================== DELETE VOL (ADMIN) =====================
    public void deleteVol(Long reservationId) {
        ReservationVol r = reservationVolRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("ReservationVol", reservationId));

        // règle safe: on ne supprime pas une reservation confirmée
        if (r.getStatus() == ReservationStatus.CONFIRMED) {
            throw new BadRequestException("Impossible de supprimer une réservation payée (CONFIRMED)");
        }

        // Si pas encore annulée -> rendre les places avant suppression
        if (r.getStatus() != ReservationStatus.CANCELED) {
            Vol aller = r.getVol();
            aller.setPlacesDisponibles(aller.getPlacesDisponibles() + r.getNbPlaces());
            volRepository.save(aller);

            if (r.getVolRetour() != null) {
                Vol retour = r.getVolRetour();
                retour.setPlacesDisponibles(retour.getPlacesDisponibles() + r.getNbPlaces());
                volRepository.save(retour);
            }
        }

        reservationVolRepository.delete(r);
    }

    // ===================== DELETE HOTEL (ADMIN) =====================
    public void deleteHotel(Long reservationId) {
        ReservationHotel r = reservationHotelRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("ReservationHotel", reservationId));

        if (r.getStatus() == ReservationStatus.CONFIRMED) {
            throw new BadRequestException("Impossible de supprimer une réservation payée (CONFIRMED)");
        }

        // Si pas encore annulée -> rendre les chambres avant suppression
        if (r.getStatus() != ReservationStatus.CANCELED) {
            Hotel h = r.getHotel();
            h.setChambresDisponibles(h.getChambresDisponibles() + r.getRooms());
            hotelRepository.save(h);
        }

        reservationHotelRepository.delete(r);
    }
}
