package com.example.reservations_voyages.user.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {
    CLIENT,
    ADMIN;

    @JsonValue
    public String getValue() {
        return name();
    }

    @JsonCreator
    public static Role fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Role.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + value + ". Expected: CLIENT or ADMIN");
        }
    }
}
