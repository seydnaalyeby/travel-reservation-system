package com.example.reservations_voyages.security.config;

import com.example.reservations_voyages.security.jwt.JwtAuthFilter;
import com.example.reservations_voyages.security.jwt.JwtProperties;
import com.example.reservations_voyages.security.jwt.JwtService;
import com.example.reservations_voyages.user.service.CustomUserDetailsService;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;  // ← Ajouté
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
@EnableMethodSecurity(prePostEnabled = true)  // ← Permet @PreAuthorize, @Secured, etc.
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtService jwtService(JwtProperties props) {
        return new JwtService(props);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public JwtAuthFilter jwtAuthFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        return new JwtAuthFilter(jwtService, userDetailsService);
    }

    // ==================== CORS CONFIGURATION ====================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200")); // Angular dev server
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight 1 heure

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // ==================== SECURITY FILTER CHAIN ====================
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
                // CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // CSRF désactivé (API stateless avec JWT)
                .csrf(csrf -> csrf.disable())

                // Stateless (pas de session)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Autorisations
                .authorizeHttpRequests(auth -> auth
                        // Autoriser explicitement les preflight OPTIONS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Console H2 (uniquement en dev/profil local)
                        .requestMatchers("/h2-console/**").permitAll()

                        // Routes publiques d'authentification
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/auth/forgot-password", "/api/auth/reset-password").permitAll()

                        // Routes protégées par rôle
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/client/**").hasAnyRole("CLIENT", "ADMIN")

                        // Tout le reste nécessite d'être authentifié
                        .anyRequest().authenticated()
                )

                // Filtre JWT avant le filtre standard d'authentification
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                // Permet l'affichage de la console H2 dans un frame/iframe
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));

        return http.build();
    }
}
