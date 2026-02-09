package com.example.reservations_voyages.auth.dto;

import com.example.reservations_voyages.user.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @Size(min = 3, max = 120) String fullName,
        @Email String email,
        @Size(min = 6, max = 120) String password,
        Role role,
        Boolean enabled
) {}
