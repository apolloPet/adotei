package com.apollopet.adotei.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class SystemParameterDtos {

    public record UpsertSystemParameterRequest(
        @NotBlank String category,
        @NotBlank String key,
        @NotBlank String value,
        String description,
        boolean active
    ) {}

    public record SystemParameterResponse(
        UUID id,
        String category,
        String key,
        String value,
        String description,
        boolean active
    ) {}
}
