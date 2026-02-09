package com.example.reservations_voyages.auth.controller;

import com.example.reservations_voyages.auth.dto.ForgotPasswordRequest;
import com.example.reservations_voyages.auth.dto.ResetPasswordRequest;
import com.example.reservations_voyages.auth.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final PasswordResetService service;

    public PasswordResetController(PasswordResetService service) {
        this.service = service;
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgot(@Valid @RequestBody ForgotPasswordRequest req) {
        service.sendResetLink(req.email());
        return Map.of("message", "If the email exists, a reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public Map<String, String> reset(@Valid @RequestBody ResetPasswordRequest req) {
        service.resetPassword(req.token(), req.newPassword());
        return Map.of("message", "Password reset successful");
    }
}
