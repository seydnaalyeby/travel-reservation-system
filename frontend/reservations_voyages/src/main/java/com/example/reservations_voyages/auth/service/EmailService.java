package com.example.reservations_voyages.auth.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendResetPasswordEmail(String to, String resetLink) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("Reset Password - Reservations Voyages");
        msg.setText("""
                Bonjour,
                
                Pour réinitialiser votre mot de passe, cliquez sur ce lien :
                %s
                
                Ce lien expire bientôt.
                
                Merci.
                """.formatted(resetLink));

        mailSender.send(msg);
    }
}
