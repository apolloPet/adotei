package com.apollopet.adotei.backend.web.dto;

import com.apollopet.adotei.backend.domain.entity.InterestType;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public class AdoptionInterestDtos {

    public record RegisterAdoptionInterestRequest(
        @NotNull InterestType interestType
    ) {}

    public record AdoptionInterestResponse(
        UUID id,
        UUID animalId,
        UUID userId,
        String userFullName,
        String userEmail,
        String userPhone,
        InterestType interestType,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
    ) {}
}
