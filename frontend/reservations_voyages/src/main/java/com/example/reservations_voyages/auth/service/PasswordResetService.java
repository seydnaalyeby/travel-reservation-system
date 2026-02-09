package com.example.reservations_voyages.auth.service;

import com.example.reservations_voyages.user.entity.*;
import com.example.reservations_voyages.user.repo.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Duration TTL = Duration.ofMinutes(15);

    private final UserRepository userRepo;
    private final PasswordResetTokenRepository tokenRepo;
    private final PasswordEncoder encoder;
    private final EmailService emailService;

    @Value("${app.front.reset-url}")
    private String frontResetUrl;

    public PasswordResetService(UserRepository userRepo,
                                PasswordResetTokenRepository tokenRepo,
                                PasswordEncoder encoder,
                                EmailService emailService) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.encoder = encoder;
        this.emailService = emailService;
    }

    public void sendResetLink(String email) {
        userRepo.findByEmail(email).ifPresent(user -> {
            String rawToken = UUID.randomUUID().toString();
            String hash = sha256(rawToken);

            PasswordResetToken prt = new PasswordResetToken();
            prt.setUser(user);
            prt.setTokenHash(hash);
            prt.setExpiresAt(Instant.now().plus(TTL));

            tokenRepo.save(prt);

            String link = frontResetUrl + "?token=" + rawToken;

            // ✅ envoyer email
            emailService.sendResetPasswordEmail(email, link);
        });

        // ⚠️ Toujours réponse "OK" même si email inexistant (sécurité)
    }

    public void resetPassword(String rawToken, String newPassword) {
        String hash = sha256(rawToken);

        PasswordResetToken token = tokenRepo.findByTokenHash(hash)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = token.getUser();
        user.setPasswordHash(encoder.encode(newPassword));
        userRepo.save(user);

        tokenRepo.delete(token);
    }

    private String sha256(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(raw.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
