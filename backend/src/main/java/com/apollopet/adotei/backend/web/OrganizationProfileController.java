package com.apollopet.adotei.backend.web;

import com.apollopet.adotei.backend.application.service.OrganizationProfileService;
import com.apollopet.adotei.backend.web.dto.OrganizationProfileDtos.OrganizationPublicDetailResponse;
import com.apollopet.adotei.backend.web.dto.OrganizationProfileDtos.OrganizationPublicSummaryResponse;
import com.apollopet.adotei.backend.web.dto.OrganizationProfileDtos.UpdateOrganizationProfileRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationProfileController {

    private final OrganizationProfileService organizationProfileService;

    public OrganizationProfileController(OrganizationProfileService organizationProfileService) {
        this.organizationProfileService = organizationProfileService;
    }

    @GetMapping("/public")
    public List<OrganizationPublicSummaryResponse> listPublic() {
        return organizationProfileService.listPublic();
    }

    @GetMapping("/{id}/public")
    public OrganizationPublicDetailResponse getPublic(@PathVariable UUID id) {
        return organizationProfileService.getPublic(id);
    }

    @PutMapping("/{id}/profile")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public OrganizationPublicDetailResponse updateProfile(
        @PathVariable UUID id,
        Authentication authentication,
        @Valid @RequestBody UpdateOrganizationProfileRequest request
    ) {
        return organizationProfileService.updateProfile(id, authentication.getName(), request);
    }
}
