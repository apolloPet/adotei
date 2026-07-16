package com.apollopet.adotei.backend.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class AuthDtos {

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record RegisterRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6) String password,
        @Pattern(
            regexp = "(^$)|(^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$)",
            message = "telefone invalido"
        )
        String phone,
        String addressLine,
        String addressNumber,
        String neighborhood,
        String city,
        String state,
        @Pattern(
            regexp = "(^$)|(^\\d{8}$)|(^\\d{5}-\\d{3}$)",
            message = "CEP invalido. Use 00000000 ou 00000-000"
        )
        String zipCode,
        String housingType,
        Boolean hasChildren,
        String childrenAges,
        Boolean hadPetsBefore,
        Boolean currentlyHasPets,
        String currentPetsTypes,
        Integer hoursAloneDaily,
        Boolean willCoverVaccines,
        Boolean willCoverEmergencies,
        Boolean awareOfCosts
    ) {}

    public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 6) String newPassword
    ) {}

    public record AuthResponse(
        String accessToken,
        Instant expiresAt,
        UserSession user
    ) {}

    public record UserSession(
        UUID id,
        String authSubject,
        String fullName,
        String email,
        String userType,
        List<String> roles,
        UserDtos.AdminPermissionsDto permissions
    ) {}
}
