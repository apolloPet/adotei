package com.apollopet.adotei.backend.application.service;

import com.apollopet.adotei.backend.application.exception.BadRequestException;
import com.apollopet.adotei.backend.application.exception.NotFoundException;
import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.Organization;
import com.apollopet.adotei.backend.domain.entity.OrganizationPersonality;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import com.apollopet.adotei.backend.domain.repository.OrganizationPersonalityRepository;
import com.apollopet.adotei.backend.domain.repository.OrganizationRepository;
import com.apollopet.adotei.backend.web.dto.PersonalityDtos.PersonalityRequest;
import com.apollopet.adotei.backend.web.dto.PersonalityDtos.PersonalityResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PersonalityService {

    private final OrganizationPersonalityRepository personalityRepository;
    private final OrganizationRepository organizationRepository;
    private final AppUserRepository appUserRepository;

    public PersonalityService(
        OrganizationPersonalityRepository personalityRepository,
        OrganizationRepository organizationRepository,
        AppUserRepository appUserRepository
    ) {
        this.personalityRepository = personalityRepository;
        this.organizationRepository = organizationRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional(readOnly = true)
    public List<PersonalityResponse> list(UUID organizationId, String requesterAuthSubject) {
        UUID resolvedOrgId = resolveOrganizationId(organizationId, requesterAuthSubject);
        return personalityRepository.findByOrganizationIdAndActiveTrueOrderByNameAsc(resolvedOrgId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public PersonalityResponse create(UUID organizationId, PersonalityRequest request, String requesterAuthSubject) {
        UUID resolvedOrgId = resolveOrganizationId(organizationId, requesterAuthSubject);
        Organization organization = organizationRepository.findById(resolvedOrgId)
            .orElseThrow(() -> new NotFoundException("Organizacao nao encontrada"));

        String name = request.name().trim();
        if (personalityRepository.existsByOrganizationIdAndNameIgnoreCase(resolvedOrgId, name)) {
            throw new BadRequestException("Ja existe uma personalidade com este nome nesta ONG.");
        }

        OrganizationPersonality personality = new OrganizationPersonality();
        personality.setOrganization(organization);
        apply(personality, request);
        return toResponse(personalityRepository.save(personality));
    }

    @Transactional
    public PersonalityResponse update(UUID id, PersonalityRequest request, String requesterAuthSubject) {
        OrganizationPersonality personality = loadAndAssertAccess(id, requesterAuthSubject);
        String name = request.name().trim();
        UUID orgId = personality.getOrganization().getId();
        if (!personality.getName().equalsIgnoreCase(name)
            && personalityRepository.existsByOrganizationIdAndNameIgnoreCase(orgId, name)) {
            throw new BadRequestException("Ja existe uma personalidade com este nome nesta ONG.");
        }
        apply(personality, request);
        return toResponse(personalityRepository.save(personality));
    }

    @Transactional
    public void delete(UUID id, String requesterAuthSubject) {
        OrganizationPersonality personality = loadAndAssertAccess(id, requesterAuthSubject);
        personalityRepository.delete(personality);
    }

    @Transactional(readOnly = true)
    public OrganizationPersonality loadForAnimal(UUID personalityId, Organization animalOrganization) {
        if (personalityId == null) {
            throw new BadRequestException("Personalidade e temperamento sao obrigatorios.");
        }
        OrganizationPersonality personality = personalityRepository.findById(personalityId)
            .orElseThrow(() -> new NotFoundException("Personalidade nao encontrada"));
        if (!personality.isActive()) {
            throw new BadRequestException("Personalidade selecionada esta inativa.");
        }
        if (animalOrganization == null) {
            throw new BadRequestException("Animal precisa estar vinculado a uma ONG para usar personalidade.");
        }
        if (!personality.getOrganization().getId().equals(animalOrganization.getId())) {
            throw new BadRequestException("Personalidade nao pertence a ONG do animal.");
        }
        return personality;
    }

    private OrganizationPersonality loadAndAssertAccess(UUID id, String requesterAuthSubject) {
        OrganizationPersonality personality = personalityRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Personalidade nao encontrada"));
        assertCanManageOrganization(requesterAuthSubject, personality.getOrganization().getId());
        return personality;
    }

    private UUID resolveOrganizationId(UUID organizationId, String requesterAuthSubject) {
        AppUser requester = loadRequester(requesterAuthSubject);
        if (requester.getUserType() == UserType.VOLUNTARIO) {
            if (requester.getOrganization() == null) {
                throw new BadRequestException("Voluntario precisa estar vinculado a uma ONG.");
            }
            if (organizationId != null && !organizationId.equals(requester.getOrganization().getId())) {
                throw new AccessDeniedException("Voluntario so pode acessar personalidades da propria ONG.");
            }
            return requester.getOrganization().getId();
        }
        if (organizationId == null) {
            throw new BadRequestException("organizationId e obrigatorio para listar personalidades.");
        }
        return organizationId;
    }

    private void assertCanManageOrganization(String requesterAuthSubject, UUID organizationId) {
        AppUser requester = loadRequester(requesterAuthSubject);
        if (requester.getUserType() == UserType.VOLUNTARIO) {
            if (requester.getOrganization() == null) {
                throw new AccessDeniedException("Voluntario sem ONG vinculada.");
            }
            if (!requester.getOrganization().getId().equals(organizationId)) {
                throw new AccessDeniedException("Voluntario so pode gerenciar personalidades da propria ONG.");
            }
        }
    }

    private AppUser loadRequester(String authSubject) {
        return appUserRepository.findByAuthSubject(authSubject)
            .orElseThrow(() -> new NotFoundException("Usuario autenticado nao encontrado"));
    }

    private void apply(OrganizationPersonality personality, PersonalityRequest request) {
        personality.setName(request.name().trim());
        personality.setDescription(request.description().trim());
        personality.setActive(request.active());
    }

    private PersonalityResponse toResponse(OrganizationPersonality personality) {
        return new PersonalityResponse(
            personality.getId(),
            personality.getOrganization().getId(),
            personality.getName(),
            personality.getDescription(),
            personality.isActive()
        );
    }
}
