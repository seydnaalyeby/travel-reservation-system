package com.example.reservations_voyages.auth.service;

import com.example.reservations_voyages.auth.dto.*;
import com.example.reservations_voyages.common.exception.*;
import com.example.reservations_voyages.security.jwt.JwtService;
import com.example.reservations_voyages.user.entity.*;
import com.example.reservations_voyages.user.repo.UserRepository;
import com.example.reservations_voyages.user.repo.RefreshTokenRepository;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepo;

    public AuthService(UserRepository userRepo,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authManager,
                       JwtService jwtService,
                       RefreshTokenRepository refreshTokenRepo) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.refreshTokenRepo = refreshTokenRepo;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().toLowerCase();

        if (userRepo.existsByEmail(email)) {
            throw new BadRequestException("Email already used");
        }

        String hash = passwordEncoder.encode(req.password());

        // ✅ Register = CLIENT par défaut
        User user = new User(req.fullName(), email, hash, Role.CLIENT);
        userRepo.save(user);

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = createRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest req) {
        try {
            var authToken = new UsernamePasswordAuthenticationToken(
                    req.email().toLowerCase(),
                    req.password()
            );
            authManager.authenticate(authToken);
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Invalid credentials");
        }

        var user = userRepo.findByEmail(req.email().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!user.isEnabled()) {
            throw new UnauthorizedException("Account disabled");
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = createRefreshToken(user);
        return new AuthResponse(accessToken, refreshToken, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public String createRefreshToken(User user) {
        // Delete existing refresh tokens for this user
        refreshTokenRepo.deleteByUser(user);
        
        // Generate new refresh token
        String refreshTokenString = jwtService.generateRefreshToken(user.getId(), user.getEmail());
        Instant expiryDate = Instant.now().plusSeconds(7 * 24 * 60 * 60); // 7 days
        
        RefreshToken refreshToken = new RefreshToken(refreshTokenString, user, expiryDate);
        refreshTokenRepo.save(refreshToken);
        
        return refreshTokenString;
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest req) {
        String refreshTokenString = req.refreshToken();
        
        // Validate refresh token format and signature
        if (!jwtService.isValid(refreshTokenString) || !jwtService.isRefreshToken(refreshTokenString)) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        
        // Find refresh token in database
        RefreshToken refreshToken = refreshTokenRepo.findByToken(refreshTokenString)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));
        
        // Check if token is expired
        if (refreshToken.isExpired()) {
            refreshTokenRepo.delete(refreshToken);
            throw new UnauthorizedException("Refresh token expired");
        }
        
        User user = refreshToken.getUser();
        
        // Check if user is still enabled
        if (!user.isEnabled()) {
            throw new UnauthorizedException("Account disabled");
        }
        
        // Generate new access token
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        
        // Generate new refresh token (rotating refresh tokens)
        String newRefreshToken = createRefreshToken(user);
        
        return new AuthResponse(accessToken, newRefreshToken, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepo.findByToken(refreshToken).ifPresent(token -> {
            refreshTokenRepo.delete(token);
        });
    }
}
