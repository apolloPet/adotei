package com.apollopet.adotei.backend.web;

import com.apollopet.adotei.backend.application.service.PersonalityService;
import com.apollopet.adotei.backend.web.dto.PersonalityDtos.PersonalityRequest;
import com.apollopet.adotei.backend.web.dto.PersonalityDtos.PersonalityResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/personalities")
public class PersonalityController {

    private final PersonalityService personalityService;

    public PersonalityController(PersonalityService personalityService) {
        this.personalityService = personalityService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public List<PersonalityResponse> list(
        @RequestParam(required = false) UUID organizationId,
        Authentication authentication
    ) {
        return personalityService.list(organizationId, authentication.getName());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.CREATED)
    public PersonalityResponse create(
        @RequestParam(required = false) UUID organizationId,
        @Valid @RequestBody PersonalityRequest request,
        Authentication authentication
    ) {
        return personalityService.create(organizationId, request, authentication.getName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public PersonalityResponse update(
        @PathVariable UUID id,
        @Valid @RequestBody PersonalityRequest request,
        Authentication authentication
    ) {
        return personalityService.update(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, Authentication authentication) {
        personalityService.delete(id, authentication.getName());
    }
}
