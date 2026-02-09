package com.example.reservations_voyages.security.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(
        String secret,
        long expirationMinutes,
        long refreshExpirationDays
) {}
