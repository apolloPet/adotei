package com.apollopet.adotei.backend.web;

import com.apollopet.adotei.backend.application.service.CatalogService;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.AdoptionRequirementRequest;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.AdoptionRequirementResponse;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.OrganizationRequest;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.OrganizationResponse;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.TemperamentTraitRequest;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.TemperamentTraitResponse;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.TutorRequest;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.TutorResponse;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.VaccineRequest;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.VaccineResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/tutors")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public List<TutorResponse> listTutors() {
        return catalogService.listTutors();
    }

    @PostMapping("/tutors")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.CREATED)
    public TutorResponse createTutor(@Valid @RequestBody TutorRequest request) {
        return catalogService.createTutor(request);
    }

    @PutMapping("/tutors/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public TutorResponse updateTutor(@PathVariable UUID id, @Valid @RequestBody TutorRequest request) {
        return catalogService.updateTutor(id, request);
    }

    @DeleteMapping("/tutors/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTutor(@PathVariable UUID id) {
        catalogService.deleteTutor(id);
    }

    @GetMapping("/organizations")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public List<OrganizationResponse> listOrganizations() {
        return catalogService.listOrganizations();
    }

    @PostMapping("/organizations")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.CREATED)
    public OrganizationResponse createOrganization(@Valid @RequestBody OrganizationRequest request) {
        return catalogService.createOrganization(request);
    }

    @PutMapping("/organizations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public OrganizationResponse updateOrganization(@PathVariable UUID id, @Valid @RequestBody OrganizationRequest request) {
        return catalogService.updateOrganization(id, request);
    }

    @DeleteMapping("/organizations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrganization(@PathVariable UUID id) {
        catalogService.deleteOrganization(id);
    }

    @GetMapping("/vaccines")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public List<VaccineResponse> listVaccines() {
        return catalogService.listVaccines();
    }

    @PostMapping("/vaccines")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.CREATED)
    public VaccineResponse createVaccine(@Valid @RequestBody VaccineRequest request) {
        return catalogService.createVaccine(request);
    }

    @PutMapping("/vaccines/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public VaccineResponse updateVaccine(@PathVariable UUID id, @Valid @RequestBody VaccineRequest request) {
        return catalogService.updateVaccine(id, request);
    }

    @DeleteMapping("/vaccines/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVaccine(@PathVariable UUID id) {
        catalogService.deleteVaccine(id);
    }

    @GetMapping("/temperament-traits")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public List<TemperamentTraitResponse> listTraits() {
        return catalogService.listTraits();
    }

    @PostMapping("/temperament-traits")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.CREATED)
    public TemperamentTraitResponse createTrait(@Valid @RequestBody TemperamentTraitRequest request) {
        return catalogService.createTrait(request);
    }

    @PutMapping("/temperament-traits/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public TemperamentTraitResponse updateTrait(@PathVariable UUID id, @Valid @RequestBody TemperamentTraitRequest request) {
        return catalogService.updateTrait(id, request);
    }

    @DeleteMapping("/temperament-traits/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTrait(@PathVariable UUID id) {
        catalogService.deleteTrait(id);
    }

    @GetMapping("/adoption-requirements")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public List<AdoptionRequirementResponse> listRequirements() {
        return catalogService.listRequirements();
    }

    @PostMapping("/adoption-requirements")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.CREATED)
    public AdoptionRequirementResponse createRequirement(@Valid @RequestBody AdoptionRequirementRequest request) {
        return catalogService.createRequirement(request);
    }

    @PutMapping("/adoption-requirements/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public AdoptionRequirementResponse updateRequirement(
        @PathVariable UUID id,
        @Valid @RequestBody AdoptionRequirementRequest request
    ) {
        return catalogService.updateRequirement(id, request);
    }

    @DeleteMapping("/adoption-requirements/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRequirement(@PathVariable UUID id) {
        catalogService.deleteRequirement(id);
    }
}
