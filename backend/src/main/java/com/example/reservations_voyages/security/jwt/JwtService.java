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
        System.out.println("🔑 JWT Service initialized");
        System.out.println("Secret key length: " + props.secret().length());
        System.out.println("Access token expiration: " + props.expirationMinutes() + " minutes");
        System.out.println("Refresh token expiration: " + props.refreshExpirationDays() + " days");
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
                .clockSkewSeconds(30) // Allow 30 seconds clock skew
                .build()
                .parseSignedClaims(token);
    }

    public boolean isValid(String token) {
        try {
            System.out.println("🔍 Validating JWT token...");
            var parsed = parse(token);
            var claims = parsed.getPayload();
            System.out.println("Token subject: " + claims.getSubject());
            System.out.println("Token issued at: " + claims.getIssuedAt());
            System.out.println("Token expiration: " + claims.getExpiration());
            System.out.println("Token type: " + claims.get("type"));
            
            // Check if token is close to expiration
            var expiration = claims.getExpiration().toInstant();
            var now = Instant.now();
            var minutesUntilExpiry = java.time.Duration.between(now, expiration).toMinutes();
            
            if (minutesUntilExpiry <= 1) {
                System.out.println("⚠️  Token will expire in " + minutesUntilExpiry + " minutes - consider refreshing");
            }
            
            System.out.println("✅ Token is valid");
            return true;
        } catch (ExpiredJwtException ex) {
            System.out.println("❌ Token expired: " + ex.getMessage());
            return false;
        } catch (JwtException | IllegalArgumentException ex) {
            System.out.println("❌ Token validation failed: " + ex.getMessage());
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
