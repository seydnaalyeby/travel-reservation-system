package com.example.reservations_voyages.auth.service;

import com.example.reservations_voyages.common.exception.BadRequestException;
import com.example.reservations_voyages.common.exception.ResourceNotFoundException;
import com.example.reservations_voyages.auth.dto.ReservationResponse;
import com.example.reservations_voyages.auth.dto.ReserveHotelRequest;
import com.example.reservations_voyages.auth.dto.ReserveVolRequest;
import com.example.reservations_voyages.user.entity.*;
import com.example.reservations_voyages.user.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientReservationService {

    private final UserRepository userRepository;
    private final VolRepository volRepository;
    private final HotelRepository hotelRepository;

    private final ReservationVolRepository reservationVolRepository;
    private final ReservationHotelRepository reservationHotelRepository;

    // ================== RESERVER UN VOL (PENDING_PAYMENT) ==================
    public ReservationResponse reserveVol(String userEmail, ReserveVolRequest req) {
        User client = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));

        Vol volAller = volRepository.findById(req.volId())
                .orElseThrow(() -> new ResourceNotFoundException("Vol", req.volId()));

        // 1) Vérif places ALLER
        if (volAller.getPlacesDisponibles() < req.nbPlaces()) {
            throw new BadRequestException("Pas assez de places disponibles pour le vol aller");
        }

        Vol volRetour = null;
        boolean roundTrip = (req.volRetourId() != null);

        if (roundTrip) {
            if (req.volRetourId().equals(req.volId())) {
                throw new BadRequestException("Le vol retour doit être différent du vol aller");
            }

            volRetour = volRepository.findById(req.volRetourId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vol", req.volRetourId()));

            // 2) Vérif places RETOUR
            if (volRetour.getPlacesDisponibles() < req.nbPlaces()) {
                throw new BadRequestException("Pas assez de places disponibles pour le vol retour");
            }

            // 3) Validations (optionnel)
            if (!volAller.getAeroportDepart().equals(volRetour.getAeroportArrivee())
                    || !volAller.getAeroportArrivee().equals(volRetour.getAeroportDepart())) {
                throw new BadRequestException("Le vol retour doit être l'inverse du vol aller (A→B puis B→A)");
            }

            if (volAller.getDateHeureDepart() != null && volRetour.getDateHeureDepart() != null
                    && !volRetour.getDateHeureDepart().isAfter(volAller.getDateHeureDepart())) {
                throw new BadRequestException("La date/heure du vol retour doit être après la date/heure du vol aller");
            }

        }

        // 4) Bloquer les places
        volAller.setPlacesDisponibles(volAller.getPlacesDisponibles() - req.nbPlaces());
        volRepository.save(volAller);

        if (roundTrip) {
            volRetour.setPlacesDisponibles(volRetour.getPlacesDisponibles() - req.nbPlaces());
            volRepository.save(volRetour);
        }

        // 5) Calcul total
        BigDecimal total = volAller.getPrixBase().multiply(BigDecimal.valueOf(req.nbPlaces()));
        if (roundTrip) {
            total = total.add(volRetour.getPrixBase().multiply(BigDecimal.valueOf(req.nbPlaces())));
        }

        // 6) Créer reservation
        ReservationVol r = new ReservationVol();
        r.setClient(client);
        r.setVol(volAller);
        r.setNbPlaces(req.nbPlaces());
        r.setTotalPrice(total);
        r.setStatus(ReservationStatus.PENDING_PAYMENT);

        if (roundTrip) {
            r.setVolRetour(volRetour);
            r.setTripType(TripType.ROUND_TRIP);
        } else {
            r.setTripType(TripType.ONE_WAY);
        }

        r = reservationVolRepository.save(r);
        return toResponse(r);
    }

    // ================== RESERVER UN HOTEL (PENDING_PAYMENT) ==================
    public ReservationResponse reserveHotel(String userEmail, ReserveHotelRequest req) {
        User client = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));

        Hotel hotel = hotelRepository.findById(req.hotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", req.hotelId()));

        long nights = ChronoUnit.DAYS.between(req.checkIn(), req.checkOut());
        if (nights <= 0) {
            throw new BadRequestException("checkOut doit être après checkIn");
        }

        if (hotel.getChambresDisponibles() < req.rooms()) {
            throw new BadRequestException("Pas assez de chambres disponibles");
        }

        hotel.setChambresDisponibles(hotel.getChambresDisponibles() - req.rooms());
        hotelRepository.save(hotel);

        BigDecimal total = hotel.getPrixParNuit()
                .multiply(BigDecimal.valueOf(nights))
                .multiply(BigDecimal.valueOf(req.rooms()));

        ReservationHotel r = new ReservationHotel();
        r.setClient(client);
        r.setHotel(hotel);
        r.setCheckIn(req.checkIn());
        r.setCheckOut(req.checkOut());
        r.setRooms(req.rooms());
        r.setTotalPrice(total);
        r.setStatus(ReservationStatus.PENDING_PAYMENT);

        r = reservationHotelRepository.save(r);
        return toResponse(r);
    }

    // ================== MES RESERVATIONS ==================
    @Transactional(readOnly = true)
    public List<ReservationResponse> myReservations(String userEmail) {
        User client = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));

        List<ReservationResponse> res = new ArrayList<>();

        reservationVolRepository.findByClientIdOrderByCreatedAtDesc(client.getId())
                .forEach(r -> res.add(toResponse(r)));

        reservationHotelRepository.findByClientIdOrderByCreatedAtDesc(client.getId())
                .forEach(r -> res.add(toResponse(r)));

        return res;
    }

    // ================== ANNULER VOL ==================
    public void cancelVol(String userEmail, Long reservationId) {
        User client = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));

        ReservationVol r = reservationVolRepository.findByIdAndClientId(reservationId, client.getId())
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

    // ================== ANNULER HOTEL ==================
    public void cancelHotel(String userEmail, Long reservationId) {
        User client = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));

        ReservationHotel r = reservationHotelRepository.findByIdAndClientId(reservationId, client.getId())
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

    // ================== MAPPING RESPONSE ==================
    private ReservationResponse toResponse(ReservationVol r) {
        Vol a = r.getVol();
        String infoAller = a.getNumeroVol() + " - " +
                a.getAeroportDepart() + "→" + a.getAeroportArrivee();

        Long retourId = null;
        String retourInfo = null;

        if (r.getVolRetour() != null) {
            Vol ret = r.getVolRetour();
            retourId = ret.getId();
            retourInfo = ret.getNumeroVol() + " - " +
                    ret.getAeroportDepart() + "→" + ret.getAeroportArrivee();
        }

        return new ReservationResponse(
                r.getId(), "VOL", r.getStatus(), r.getTotalPrice(), r.getCreatedAt(),
                a.getId(), infoAller, r.getNbPlaces(),
                retourId, retourInfo,
                null, null, null, null, null
        );
    }


    private ReservationResponse toResponse(ReservationHotel r) {
        Hotel h = r.getHotel();
        return new ReservationResponse(
                r.getId(), "HOTEL", r.getStatus(), r.getTotalPrice(), r.getCreatedAt(),
                null, null, null,
                null, null,
                h.getId(), h.getNom(), r.getCheckIn(), r.getCheckOut(), r.getRooms()
        );
    }


}
