package com.apollopet.adotei.backend.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public class UserDtos {

    public record UpsertUserRequest(
        @NotBlank String authSubject,
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @Pattern(
            regexp = "(^$)|(^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$)",
            message = "telefone invalido"
        )
        String phone,
        @NotBlank
        @Pattern(
            regexp = "ADOTANTE|VOLUNTARIO|ADMIN",
            message = "deve ser ADOTANTE, VOLUNTARIO ou ADMIN"
        )
        String userType,
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
        UUID organizationId,
        Boolean organizationResponsible,
        @Size(min = 6, message = "senha deve ter ao menos 6 caracteres")
        String password,
        @NotEmpty List<String> roles
    ) {}

    public record UpsertAdopterProfileRequest(
        String housingType,
        String ownershipType,
        Boolean rentAllowsPets,
        Boolean hasYard,
        Boolean yardWalled,
        Boolean hasWindowScreens,
        Integer residentsCount,
        Boolean hasChildren,
        String childrenAges,
        Boolean hadPetsBefore,
        Boolean currentlyHasPets,
        Integer currentPetsCount,
        String currentPetsTypes,
        Boolean returnedAnimal,
        Boolean petsVaccinated,
        Boolean petsNeutered,
        Boolean awareOfCosts,
        String monthlyBudget,
        Boolean willCoverVaccines,
        Boolean willCoverNeutering,
        Boolean willCoverEmergencies,
        String reasonToAdopt,
        Integer hoursAloneDaily,
        String ifDestroyed,
        String ifSick,
        Boolean willAdapt,
        String environmentPhotoUrl,
        String environmentVideoUrl
    ) {}

    public record UpdateOwnProfileRequest(
        @NotBlank String fullName,
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
        String zipCode
    ) {}

    public record UserResponse(
        UUID id,
        String authSubject,
        String fullName,
        String email,
        String phone,
        String userType,
        String addressLine,
        String addressNumber,
        String neighborhood,
        String city,
        String state,
        String zipCode,
        UUID organizationId,
        String organizationName,
        boolean organizationResponsible,
        List<String> roles
    ) {}

    public record UserTypeResponse(
        String code,
        String description
    ) {}
}
