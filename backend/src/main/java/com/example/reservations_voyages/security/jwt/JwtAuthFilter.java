package com.example.reservations_voyages.security.jwt;

import com.example.reservations_voyages.user.service.CustomUserDetailsService;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import java.io.IOException;

public class JwtAuthFilter extends GenericFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        String authHeader = request.getHeader("Authorization");
        
        System.out.println("🔐 JWT FILTER DEBUG");
        System.out.println("Request URL: " + request.getRequestURI());
        System.out.println("Auth Header: " + (authHeader != null ? "Present" : "Missing"));

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("Token length: " + token.length());
            System.out.println("Token valid: " + jwtService.isValid(token));

            if (jwtService.isValid(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
                var claims = jwtService.parse(token).getPayload();
                String email = claims.getSubject();
                System.out.println("Token subject: " + email);

                var userDetails = userDetailsService.loadUserByUsername(email);
                System.out.println("User authorities: " + userDetails.getAuthorities());

                var auth = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
                System.out.println("✅ Authentication set successfully");
            } else {
                System.out.println("❌ Token invalid or authentication already exists");
            }
        } else {
            System.out.println("❌ No Bearer token found");
        }

        chain.doFilter(req, res);
    }
}
