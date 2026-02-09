package com.example.reservations_voyages.auth.service;

import com.example.reservations_voyages.auth.dto.UserCreateRequest;
import com.example.reservations_voyages.auth.dto.UserResponse;
import com.example.reservations_voyages.auth.dto.UserUpdateRequest;
import com.example.reservations_voyages.user.entity.User;
import com.example.reservations_voyages.user.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminUsersService {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    public AdminUsersService(UserRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> list() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    public UserResponse get(Long id) {
        User u = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toResponse(u);
    }

    public UserResponse create(UserCreateRequest req) {
        String email = req.email().toLowerCase();

        if (repo.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User u = new User(
                req.fullName(),
                email,
                passwordEncoder.encode(req.password()),
                req.role()
        );

        if (req.enabled() != null) u.setEnabled(req.enabled());

        return toResponse(repo.save(u));
    }

    public UserResponse update(Long id, UserUpdateRequest req) {
        User u = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (req.fullName() != null) u.setFullName(req.fullName());

        if (req.password() != null && !req.password().isBlank()) {
            u.setPasswordHash(passwordEncoder.encode(req.password()));
        }

        if (req.enabled() != null) u.setEnabled(req.enabled());

         if (req.role() != null) u.setRole(req.role());


         if (req.email() != null) {
          String newEmail = req.email().toLowerCase();
           if (!newEmail.equals(u.getEmail()) && repo.existsByEmail(newEmail)) {
             throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
           }
           u.setEmail(newEmail);
         }

        return toResponse(repo.save(u));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        repo.deleteById(id);
    }

    public UserResponse setEnabled(Long id, boolean value) {
        User u = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        u.setEnabled(value);
        return toResponse(repo.save(u));
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getRole(),
                u.isEnabled()
        );
    }
}
