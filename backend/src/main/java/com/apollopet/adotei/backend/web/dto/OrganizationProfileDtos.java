package com.apollopet.adotei.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.List;
import java.util.UUID;

public class OrganizationProfileDtos {

    public record OrganizationVolunteerPublicResponse(
        UUID id,
        String fullName,
        String phone,
        boolean organizationResponsible
    ) {}

    public record OrganizationPublicSummaryResponse(
        UUID id,
        String legalName,
        String tradeName,
        String displayName,
        String city,
        String state,
        String aboutText,
        String missionFocus,
        Integer foundedYear,
        String logoUrl,
        long animalsCount
    ) {}

    public record OrganizationPublicDetailResponse(
        UUID id,
        String legalName,
        String tradeName,
        String displayName,
        String cnpj,
        String primaryContactName,
        String secondaryContactName,
        String contactPhone1,
        String contactPhone2,
        String contactEmail,
        String addressLine,
        String city,
        String state,
        String aboutText,
        String storyText,
        Integer foundedYear,
        String missionFocus,
        String structureInfo,
        String logoUrl,
        String websiteUrl,
        String instagramUrl,
        String facebookUrl,
        boolean published,
        long animalsCount,
        List<OrganizationVolunteerPublicResponse> volunteers
    ) {}

    public record UpdateOrganizationProfileRequest(
        @NotBlank String legalName,
        String tradeName,
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
        @Pattern(
            regexp = "(^$)|(^[\\w.%+-]+@[\\w.-]+\\.[A-Za-z]{2,}$)",
            message = "E-mail de contato invalido"
        )
        String contactEmail,
        String addressLine,
        @NotBlank String city,
        String state,
        String aboutText,
        String storyText,
        Integer foundedYear,
        String missionFocus,
        String structureInfo,
        String logoUrl,
        String websiteUrl,
        String instagramUrl,
        String facebookUrl,
        Boolean published
    ) {}
}
