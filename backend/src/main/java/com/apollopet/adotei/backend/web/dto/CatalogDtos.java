package com.apollopet.adotei.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.UUID;

public class CatalogDtos {

    public record TutorRequest(
        @NotBlank String fullName,
        @Pattern(
            regexp = "(^$)|(^\\d{11}$)|(^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$)",
            message = "CPF invalido. Use 00000000000 ou 000.000.000-00"
        )
        String cpf,
        String code,
        @NotBlank
        @Pattern(
            regexp = "^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$",
            message = "Telefone invalido"
        )
        String contact
    ) {}

    public record TutorResponse(
        UUID id,
        String fullName,
        String cpf,
        String code,
        String contact
    ) {}

    public record OrganizationRequest(
        @NotBlank String legalName,
        @Pattern(
            regexp = "(^$)|(^\\d{14}$)|(^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$)",
            message = "CNPJ invalido. Use 00000000000000 ou 00.000.000/0000-00"
        )
        String cnpj,
        @NotBlank String primaryContactName,
        String secondaryContactName,
        @NotBlank
        @Pattern(
            regexp = "^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$",
            message = "Telefone principal invalido"
        )
        String contactPhone1,
        @Pattern(
            regexp = "(^$)|(^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$)",
            message = "Telefone secundario invalido"
        )
        String contactPhone2,
        @NotBlank String city,
        String state
    ) {}

    public record OrganizationResponse(
        UUID id,
        String legalName,
        String cnpj,
        String primaryContactName,
        String secondaryContactName,
        String contactPhone1,
        String contactPhone2,
        String city,
        String state
    ) {}

    public record VaccineRequest(
        @NotBlank String code,
        @NotBlank String name,
        @NotBlank String animalType,
        boolean active
    ) {}

    public record VaccineResponse(UUID id, String code, String name, String animalType, boolean active) {}

    public record TemperamentTraitRequest(@NotBlank String code, @NotBlank String description, boolean active) {}

    public record TemperamentTraitResponse(UUID id, String code, String description, boolean active) {}

    public record AdoptionRequirementRequest(@NotBlank String code, @NotBlank String name, boolean active) {}

    public record AdoptionRequirementResponse(UUID id, String code, String name, boolean active) {}
}
