package com.example.reservations_voyages.auth.dto;

import com.example.reservations_voyages.user.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(
        @NotBlank @Size(min = 3, max = 120) String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, max = 120) String password,
        @NotNull Role role,
        Boolean enabled
) {}
