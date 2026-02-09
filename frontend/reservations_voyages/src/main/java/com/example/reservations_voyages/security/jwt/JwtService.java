package com.example.reservations_voyages.security.jwt;

import com.example.reservations_voyages.user.entity.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

public class JwtService {

    private final JwtProperties props;
    private final Key key;

    public JwtService(JwtProperties props) {
        this.props = props;
        this.key = Keys.hmacShaKeyFor(props.secret().getBytes(StandardCharsets.UTF_8));
    }

    // ✅ ACCESS TOKEN (short)
    public String generateAccessToken(Long userId, String email, Role role) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(props.expirationMinutes() * 60);

        return Jwts.builder()
                .subject(email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .claims(Map.of(
                        "uid", userId,
                        "role", role.name(),
                        "type", "ACCESS"
                ))
                .signWith(key)
                .compact();
    }

    // ✅ REFRESH TOKEN (long)
    public String generateRefreshToken(Long userId, String email) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(props.refreshExpirationDays() * 24 * 60 * 60);

        return Jwts.builder()
                .subject(email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .claims(Map.of(
                        "uid", userId,
                        "type", "REFRESH"
                ))
                .signWith(key)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) key)
                .build()
                .parseSignedClaims(token);
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    // ✅ helper: verify the token is a refresh token
    public boolean isRefreshToken(String token) {
        try {
            Claims claims = parse(token).getPayload();
            Object type = claims.get("type");
            return "REFRESH".equals(type);
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
