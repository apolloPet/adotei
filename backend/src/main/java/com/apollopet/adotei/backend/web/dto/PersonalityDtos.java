package com.apollopet.adotei.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class PersonalityDtos {

    public record PersonalityRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 200) String description,
        boolean active
    ) {}

    public record PersonalityResponse(
        UUID id,
        UUID organizationId,
        String name,
        String description,
        boolean active
    ) {}
}
