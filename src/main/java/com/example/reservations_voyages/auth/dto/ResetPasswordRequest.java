package com.example.reservations_voyages.auth.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 6) String newPassword,
        @NotBlank @Size(min = 6) String confirmPassword
) {}

