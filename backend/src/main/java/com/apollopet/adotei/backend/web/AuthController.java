package com.apollopet.adotei.backend.web;

import com.apollopet.adotei.backend.application.service.AuthService;
import com.apollopet.adotei.backend.web.dto.AuthDtos.AuthResponse;
import com.apollopet.adotei.backend.web.dto.AuthDtos.ChangePasswordRequest;
import com.apollopet.adotei.backend.web.dto.AuthDtos.LoginRequest;
import com.apollopet.adotei.backend.web.dto.AuthDtos.RegisterRequest;
import com.apollopet.adotei.backend.web.dto.AuthDtos.UserSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
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
}
