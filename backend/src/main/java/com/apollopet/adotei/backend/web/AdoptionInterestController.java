package com.apollopet.adotei.backend.web;

import com.apollopet.adotei.backend.application.service.AdoptionInterestService;
import com.apollopet.adotei.backend.web.dto.AdoptionInterestDtos.AdoptionInterestResponse;
import com.apollopet.adotei.backend.web.dto.AdoptionInterestDtos.RegisterAdoptionInterestRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/animals")
public class AdoptionInterestController {

    private final AdoptionInterestService adoptionInterestService;

    public AdoptionInterestController(AdoptionInterestService adoptionInterestService) {
        this.adoptionInterestService = adoptionInterestService;
    }

    @GetMapping("/interests/animal-ids")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public List<UUID> listAnimalIdsWithInterests(Authentication authentication) {
        return adoptionInterestService.listAnimalIdsWithInterests(authentication.getName());
    }

    @GetMapping("/interests/my-animal-ids")
    @PreAuthorize("isAuthenticated()")
    public List<UUID> listMyAnimalIdsWithInterests(Authentication authentication) {
        return adoptionInterestService.listMyAnimalIdsWithInterests(authentication.getName());
    }

    @PostMapping("/{animalId}/interests")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public AdoptionInterestResponse registerInterest(
        @PathVariable UUID animalId,
        Authentication authentication,
        @Valid @RequestBody RegisterAdoptionInterestRequest request
    ) {
        return adoptionInterestService.register(animalId, authentication.getName(), request);
    }

    @GetMapping("/{animalId}/interests")
    @PreAuthorize("hasRole('VOLUNTARIO')")
    public List<AdoptionInterestResponse> listInterests(
        @PathVariable UUID animalId,
        Authentication authentication
    ) {
        return adoptionInterestService.listByAnimal(animalId, authentication.getName());
    }
}
