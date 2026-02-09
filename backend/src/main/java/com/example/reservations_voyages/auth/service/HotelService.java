package com.example.reservations_voyages.auth.service;

import com.example.reservations_voyages.user.entity.Hotel;
import com.example.reservations_voyages.common.exception.ResourceNotFoundException;
import com.example.reservations_voyages.user.repo.HotelRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class HotelService {

    private final HotelRepository hotelRepository;

    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    public Hotel getHotelById(Long id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", id));
    }

    // ✅ CREATE: init chambresDisponibles = chambresTotales
    public Hotel createHotel(@Valid Hotel hotel) {
        if (hotel.getChambresDisponibles() <= 0) {
            hotel.setChambresDisponibles(hotel.getChambresTotales());
        }
        return hotelRepository.save(hotel);
    }

    // ✅ UPDATE: ajuste chambresDisponibles si chambresTotales change
    public Hotel updateHotel(Long id, @Valid Hotel hotelDetails) {
        Hotel hotel = getHotelById(id);

        int oldTotal = hotel.getChambresTotales();
        int oldDisponible = hotel.getChambresDisponibles();
        int newTotal = hotelDetails.getChambresTotales();

        // combien de chambres déjà "prises" = total - disponibles
        int reserved = Math.max(0, oldTotal - oldDisponible);

        // nouveaux disponibles = newTotal - reserved (minimum 0)
        int newDisponible = Math.max(0, newTotal - reserved);

        hotel.setNom(hotelDetails.getNom());
        hotel.setAdresse(hotelDetails.getAdresse());
        hotel.setVille(hotelDetails.getVille());
        hotel.setPays(hotelDetails.getPays());
        hotel.setEtoiles(hotelDetails.getEtoiles());
        hotel.setPrixParNuit(hotelDetails.getPrixParNuit());
        hotel.setChambresTotales(newTotal);
        hotel.setChambresDisponibles(newDisponible); // ✅ IMPORTANT
        hotel.setDescription(hotelDetails.getDescription());
        hotel.setEquipements(hotelDetails.getEquipements());

        return hotelRepository.save(hotel);
    }

    public void deleteHotel(Long id) {
        Hotel hotel = getHotelById(id);
        hotelRepository.delete(hotel);
    }
}
