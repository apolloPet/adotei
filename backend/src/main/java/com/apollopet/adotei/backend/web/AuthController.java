package com.apollopet.adotei.backend.web;

import com.apollopet.adotei.backend.application.service.AuthService;
import com.apollopet.adotei.backend.infrastructure.security.CookieBearerTokenResolver;
import com.apollopet.adotei.backend.web.dto.AuthDtos.AuthResponse;
import com.apollopet.adotei.backend.web.dto.AuthDtos.ChangePasswordRequest;
import com.apollopet.adotei.backend.web.dto.AuthDtos.LoginRequest;
import com.apollopet.adotei.backend.web.dto.AuthDtos.RegisterRequest;
import com.apollopet.adotei.backend.web.dto.AuthDtos.UserSession;
import jakarta.validation.Valid;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final boolean authCookieSecure;
    private final String authCookieSameSite;

    public AuthController(
        AuthService authService,
        @Value("${app.security.cookie.secure:true}") boolean authCookieSecure,
        @Value("${app.security.cookie.same-site:Strict}") String authCookieSameSite
    ) {
        this.authService = authService;
        this.authCookieSecure = authCookieSecure;
        this.authCookieSameSite = normalizeSameSite(authCookieSameSite);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        ResponseCookie cookie = buildAuthCookie(response.accessToken(), response.expiresAt());
        return ResponseEntity.ok()
            .header("Set-Cookie", cookie.toString())
            .body(response);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> logout() {
        ResponseCookie expiredCookie = ResponseCookie.from(CookieBearerTokenResolver.AUTH_COOKIE_NAME, "")
            .httpOnly(true)
            .secure(authCookieSecure)
            .sameSite(authCookieSameSite)
            .path("/")
            .maxAge(Duration.ZERO)
            .build();
        return ResponseEntity.noContent()
            .header("Set-Cookie", expiredCookie.toString())
            .build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserSession currentUser(Authentication authentication) {
        return authService.getCurrentUser(authentication.getName());
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    public void changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(authentication.getName(), request);
    }

    private ResponseCookie buildAuthCookie(String token, Instant expiresAt) {
        long maxAgeSeconds = Math.max(0L, Duration.between(Instant.now(), expiresAt).getSeconds());
        return ResponseCookie.from(CookieBearerTokenResolver.AUTH_COOKIE_NAME, token)
            .httpOnly(true)
            .secure(authCookieSecure)
            .sameSite(authCookieSameSite)
            .path("/")
            .maxAge(maxAgeSeconds)
            .build();
    }

    private static String normalizeSameSite(String value) {
        if (value == null) {
            return "Strict";
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? "Strict" : trimmed;
    }
}
