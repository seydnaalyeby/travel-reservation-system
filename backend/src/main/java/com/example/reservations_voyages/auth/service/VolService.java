package com.example.reservations_voyages.auth.service;

import com.example.reservations_voyages.user.entity.Vol;
import com.example.reservations_voyages.common.exception.ResourceNotFoundException;
import com.example.reservations_voyages.user.repo.VolRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VolService {

    private final VolRepository volRepository;

    public List<Vol> getAllVols() {
        return volRepository.findAll();
    }

    public Vol getVolById(Long id) {
        return volRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vol", id));
    }

    public Vol getVolByNumeroVol(String numeroVol) {
        return volRepository.findByNumeroVol(numeroVol)
                .orElseThrow(() -> new ResourceNotFoundException("Vol", numeroVol));
    }

    public Vol createVol(@Valid Vol vol) {
        if (volRepository.existsByNumeroVol(vol.getNumeroVol())) {
            throw new IllegalArgumentException(
                    "Un vol avec le numéro " + vol.getNumeroVol() + " existe déjà"
            );
        }
        return volRepository.save(vol);
    }

    public Vol updateVol(Long id, @Valid Vol volDetails) {
        Vol vol = getVolById(id);

        if (!vol.getNumeroVol().equals(volDetails.getNumeroVol())
                && volRepository.existsByNumeroVol(volDetails.getNumeroVol())) {
            throw new IllegalArgumentException(
                    "Un vol avec le numéro " + volDetails.getNumeroVol() + " existe déjà"
            );
        }

        vol.setNumeroVol(volDetails.getNumeroVol());
        vol.setCompagnie(volDetails.getCompagnie());
        vol.setAeroportDepart(volDetails.getAeroportDepart());
        vol.setAeroportArrivee(volDetails.getAeroportArrivee());
        vol.setDateHeureDepart(volDetails.getDateHeureDepart());
        vol.setDateHeureArrivee(volDetails.getDateHeureArrivee());
        vol.setPlacesDisponibles(volDetails.getPlacesDisponibles());
        vol.setPrixBase(volDetails.getPrixBase());
        vol.setStatut(volDetails.getStatut());

        return volRepository.save(vol);
    }

    public void deleteVol(Long id) {
        Vol vol = getVolById(id);
        volRepository.delete(vol);
    }
}
