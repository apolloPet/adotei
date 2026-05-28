package com.apollopet.adotei.backend.web;

import com.apollopet.adotei.backend.application.service.CompatibilityService;
import com.apollopet.adotei.backend.web.dto.CompatibilityDtos.CompatibilityScoreResponse;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/compatibility")
public class CompatibilityController {

    private final CompatibilityService compatibilityService;

    public CompatibilityController(CompatibilityService compatibilityService) {
        this.compatibilityService = compatibilityService;
    }

    @GetMapping("/animals/{animalId}/users/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO','ADOTANTE')")
    public CompatibilityScoreResponse score(
        @PathVariable UUID animalId,
        @PathVariable UUID userId,
        Authentication authentication
    ) {
        return compatibilityService.score(animalId, userId, authentication.getName());
    }
}
