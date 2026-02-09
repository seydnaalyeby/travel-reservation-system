package com.example.reservations_voyages.user.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RoleConverter implements AttributeConverter<Role, String> {

    @Override
    public String convertToDatabaseColumn(Role role) {
        if (role == null) {
            return null;
        }
        return role.name(); // Store as uppercase: ADMIN, CLIENT
    }

    @Override
    public Role convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        // Case-insensitive conversion: handles both "admin" and "ADMIN"
        try {
            return Role.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role value: " + dbData + ". Expected: CLIENT or ADMIN", e);
        }
    }
}

