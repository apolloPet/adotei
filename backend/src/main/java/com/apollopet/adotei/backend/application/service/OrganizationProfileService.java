package com.apollopet.adotei.backend.application.service;

import com.apollopet.adotei.backend.application.exception.NotFoundException;
import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.Organization;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AnimalRepository;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import com.apollopet.adotei.backend.domain.repository.OrganizationRepository;
import com.apollopet.adotei.backend.web.dto.OrganizationProfileDtos.OrganizationPublicDetailResponse;
import com.apollopet.adotei.backend.web.dto.OrganizationProfileDtos.OrganizationPublicSummaryResponse;
import com.apollopet.adotei.backend.web.dto.OrganizationProfileDtos.OrganizationVolunteerPublicResponse;
import com.apollopet.adotei.backend.web.dto.OrganizationProfileDtos.UpdateOrganizationProfileRequest;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrganizationProfileService {

    private final OrganizationRepository organizationRepository;
    private final AppUserRepository appUserRepository;
    private final AnimalRepository animalRepository;

    public OrganizationProfileService(
        OrganizationRepository organizationRepository,
        AppUserRepository appUserRepository,
        AnimalRepository animalRepository
    ) {
        this.organizationRepository = organizationRepository;
        this.appUserRepository = appUserRepository;
        this.animalRepository = animalRepository;
    }

    @Transactional(readOnly = true)
    public List<OrganizationPublicSummaryResponse> listPublic() {
        return organizationRepository.findByPublishedTrueOrderByLegalNameAsc().stream()
            .map(this::toSummary)
            .toList();
    }

    @Transactional(readOnly = true)
    public OrganizationPublicDetailResponse getPublic(UUID id) {
        Organization organization = loadPublishedOrganization(id);
        return toDetail(organization);
    }

    @Transactional
    public OrganizationPublicDetailResponse updateProfile(
        UUID id,
        String requesterAuthSubject,
        UpdateOrganizationProfileRequest request
    ) {
        Organization organization = organizationRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Organizacao nao encontrada"));
        AppUser requester = appUserRepository.findByAuthSubject(requesterAuthSubject)
            .orElseThrow(() -> new NotFoundException("Usuario autenticado nao encontrado"));
        assertCanEditProfile(requester, organization);
        applyProfile(organization, request);
        return toDetail(organizationRepository.save(organization));
    }

    private void assertCanEditProfile(AppUser requester, Organization organization) {
        if (requester.getUserType() == UserType.ADMIN) {
            return;
        }
        if (requester.getUserType() == UserType.VOLUNTARIO
            && requester.isOrganizationResponsible()
            && requester.getOrganization() != null
            && requester.getOrganization().getId().equals(organization.getId())) {
            return;
        }
        throw new AccessDeniedException(
            "Apenas administradores ou voluntarios responsaveis pela ONG podem editar o perfil publico."
        );
    }

    private Organization loadPublishedOrganization(UUID id) {
        Organization organization = organizationRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Organizacao nao encontrada"));
        if (!organization.isPublished()) {
            throw new NotFoundException("Organizacao nao encontrada");
        }
        return organization;
    }

    private void applyProfile(Organization organization, UpdateOrganizationProfileRequest request) {
        organization.setLegalName(request.legalName());
        organization.setTradeName(request.tradeName());
        organization.setCnpj(request.cnpj());
        organization.setPrimaryContactName(request.primaryContactName());
        organization.setSecondaryContactName(request.secondaryContactName());
        organization.setContactPhone1(request.contactPhone1());
        organization.setContactPhone2(request.contactPhone2());
        organization.setContactEmail(request.contactEmail());
        organization.setAddressLine(request.addressLine());
        organization.setCity(request.city());
        organization.setState(request.state());
        organization.setAboutText(request.aboutText());
        organization.setStoryText(request.storyText());
        organization.setFoundedYear(request.foundedYear());
        organization.setMissionFocus(request.missionFocus());
        organization.setStructureInfo(request.structureInfo());
        organization.setLogoUrl(request.logoUrl());
        organization.setWebsiteUrl(request.websiteUrl());
        organization.setInstagramUrl(request.instagramUrl());
        organization.setFacebookUrl(request.facebookUrl());
        if (request.published() != null) {
            organization.setPublished(request.published());
        }
    }

    private OrganizationPublicSummaryResponse toSummary(Organization organization) {
        return new OrganizationPublicSummaryResponse(
            organization.getId(),
            organization.getLegalName(),
            organization.getTradeName(),
            displayName(organization),
            organization.getCity(),
            organization.getState(),
            organization.getAboutText(),
            organization.getMissionFocus(),
            organization.getFoundedYear(),
            organization.getLogoUrl(),
            animalRepository.countByOrganization_Id(organization.getId())
        );
    }

    private OrganizationPublicDetailResponse toDetail(Organization organization) {
        List<OrganizationVolunteerPublicResponse> volunteers = appUserRepository
            .findByOrganizationIdAndUserType(organization.getId(), UserType.VOLUNTARIO)
            .stream()
            .sorted(Comparator.comparing(AppUser::isOrganizationResponsible).reversed()
                .thenComparing(AppUser::getFullName, String.CASE_INSENSITIVE_ORDER))
            .map(user -> new OrganizationVolunteerPublicResponse(
                user.getId(),
                user.getFullName(),
                user.getPhone(),
                user.isOrganizationResponsible()
            ))
            .toList();

        return new OrganizationPublicDetailResponse(
            organization.getId(),
            organization.getLegalName(),
            organization.getTradeName(),
            displayName(organization),
            organization.getCnpj(),
            organization.getPrimaryContactName(),
            organization.getSecondaryContactName(),
            organization.getContactPhone1(),
            organization.getContactPhone2(),
            organization.getContactEmail(),
            organization.getAddressLine(),
            organization.getCity(),
            organization.getState(),
            organization.getAboutText(),
            organization.getStoryText(),
            organization.getFoundedYear(),
            organization.getMissionFocus(),
            organization.getStructureInfo(),
            organization.getLogoUrl(),
            organization.getWebsiteUrl(),
            organization.getInstagramUrl(),
            organization.getFacebookUrl(),
            organization.isPublished(),
            animalRepository.countByOrganization_Id(organization.getId()),
            volunteers
        );
    }

    private String displayName(Organization organization) {
        if (organization.getTradeName() != null && !organization.getTradeName().isBlank()) {
            return organization.getTradeName();
        }
        return organization.getLegalName();
    }
}
