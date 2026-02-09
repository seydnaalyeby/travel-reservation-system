package com.example.reservations_voyages.user.service;


import com.example.reservations_voyages.user.entity.*;
import com.example.reservations_voyages.user.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public AdminSeeder(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        System.out.println("🚀 AdminSeeder is running");

        String adminEmail = "admin@travel.com";
        if (!repo.existsByEmail(adminEmail)) {
            var admin = new User(
                    "System Admin",
                    adminEmail,
                    encoder.encode("Admin12345"),
                    Role.ADMIN
            );
            repo.save(admin);
            System.out.println("✅ Admin admin@travel.com created");
        } else {
            System.out.println("ℹ️ Admin already exists");
        }
    }

}

