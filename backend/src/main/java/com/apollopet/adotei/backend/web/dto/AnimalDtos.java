package com.apollopet.adotei.backend.web.dto;

import com.apollopet.adotei.backend.domain.entity.AnimalStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class AnimalDtos {

    public record AnimalAdopterProfileRequest(
        List<String> suitableHousing,
        boolean requiresYard,
        boolean requiresWalledYard,
        boolean requiresWindowScreens,
        boolean allowsRented,
        String minResidentExperience,
        boolean suitableForChildren,
        boolean suitableForFirstTimers,
        Integer maxHoursAloneDaily,
        String estimatedMonthlyCost,
        boolean requiresEmergencyBudget
    ) {}

    public record AnimalAdopterProfileResponse(
        List<String> suitableHousing,
        boolean requiresYard,
        boolean requiresWalledYard,
        boolean requiresWindowScreens,
        boolean allowsRented,
        String minResidentExperience,
        boolean suitableForChildren,
        boolean suitableForFirstTimers,
        Integer maxHoursAloneDaily,
        String estimatedMonthlyCost,
        boolean requiresEmergencyBudget
    ) {}

    public record AnimalRequest(
        @NotBlank String name,
        @NotBlank String animalType,
        String breed,
        @NotNull @Min(0) Integer ageYears,
        @NotBlank String sex,
        @NotBlank String size,
        String description,
        boolean sterilized,
        String vaccinationStatus,
        String veterinaryInfo,
        String healthConditions,
        boolean specialNeeds,
        String specialNeedsDescription,
        boolean goodWithChildren,
        boolean goodWithOtherAnimals,
        boolean goodWithSeniors,
        String energyLevel,
        String trainability,
        String location,
        String responsibleName,
        String responsibleContact,
        String tutorName,
        String tutorContact,
        String personalityTemperament,
        String additionalInfo,
        AnimalStatus status,
        UUID organizationId,
        @NotNull UUID personalityId,
        UUID tutorId,
        UUID createdByUserId,
        List<UUID> vaccineIds,
        List<UUID> temperamentTraitIds,
        List<UUID> requirementIds,
        AnimalAdopterProfileRequest adopterProfile
    ) {}

    public record AnimalImageResponse(UUID id, String fileUrl, String contentType, Integer displayOrder) {}

    public record AnimalResponse(
        UUID id,
        String name,
        String animalType,
        String breed,
        Integer ageYears,
        String sex,
        String size,
        String description,
        boolean sterilized,
        String vaccinationStatus,
        String veterinaryInfo,
        String healthConditions,
        boolean specialNeeds,
        String specialNeedsDescription,
        boolean goodWithChildren,
        boolean goodWithOtherAnimals,
        boolean goodWithSeniors,
        String energyLevel,
        String trainability,
        String location,
        String responsibleName,
        String responsibleContact,
        String tutorName,
        String tutorContact,
        String personalityTemperament,
        String additionalInfo,
        AnimalStatus status,
        UUID organizationId,
        UUID personalityId,
        String personalityName,
        UUID tutorId,
        List<UUID> vaccineIds,
        List<String> vaccineNames,
        List<UUID> temperamentTraitIds,
        List<UUID> requirementIds,
        AnimalAdopterProfileResponse adopterProfile,
        List<AnimalImageResponse> images,
        OffsetDateTime createdAt
    ) {}

    public record AnimalStatusUpdateRequest(
        @NotNull AnimalStatus status
    ) {}

    public record GenerateImageUploadRequest(
        @NotBlank String fileName,
        @NotBlank String contentType,
        @Min(0) @Max(1) Integer displayOrder
    ) {}

    public record GenerateImageUploadResponse(
        UUID imageId,
        String s3Key,
        String uploadUrl,
        String fileUrl,
        Integer displayOrder
    ) {}
}
