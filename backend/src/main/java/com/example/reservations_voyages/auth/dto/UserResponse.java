package com.example.reservations_voyages.auth.dto;


import com.example.reservations_voyages.user.entity.Role;


public record UserResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        boolean enabled
) {}

