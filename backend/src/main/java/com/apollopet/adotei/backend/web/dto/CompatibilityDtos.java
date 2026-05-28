package com.apollopet.adotei.backend.web.dto;

import java.util.List;
import java.util.UUID;

public class CompatibilityDtos {

    public record CompatibilityQuestionResult(
        String code,
        String label,
        boolean compatible,
        String adopterValue,
        String animalRequirement
    ) {}

    public record CompatibilityScoreResponse(
        UUID animalId,
        UUID userId,
        int scorePercent,
        int matchedCount,
        int totalAnsweredCount,
        List<CompatibilityQuestionResult> questions
    ) {}
}
