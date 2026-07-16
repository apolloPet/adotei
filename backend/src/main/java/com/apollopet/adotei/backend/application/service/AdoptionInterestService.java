package com.apollopet.adotei.backend.application.service;

import com.apollopet.adotei.backend.application.exception.BadRequestException;
import com.apollopet.adotei.backend.application.exception.NotFoundException;
import com.apollopet.adotei.backend.domain.entity.AdminPermission;
import com.apollopet.adotei.backend.domain.entity.AdminPermissions;
import com.apollopet.adotei.backend.domain.entity.AdoptionInterest;
import com.apollopet.adotei.backend.domain.entity.Animal;
import com.apollopet.adotei.backend.domain.entity.AnimalStatus;
import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.Organization;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AdoptionInterestRepository;
import com.apollopet.adotei.backend.domain.repository.AnimalRepository;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import com.apollopet.adotei.backend.web.dto.AdoptionInterestDtos.AdoptionInterestResponse;
import com.apollopet.adotei.backend.web.dto.AdoptionInterestDtos.RegisterAdoptionInterestRequest;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdoptionInterestService {

    private final AdoptionInterestRepository adoptionInterestRepository;
    private final AnimalRepository animalRepository;
    private final AppUserRepository appUserRepository;

    public AdoptionInterestService(
        AdoptionInterestRepository adoptionInterestRepository,
        AnimalRepository animalRepository,
        AppUserRepository appUserRepository
    ) {
        this.adoptionInterestRepository = adoptionInterestRepository;
        this.animalRepository = animalRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public AdoptionInterestResponse register(UUID animalId, String requesterAuthSubject, RegisterAdoptionInterestRequest request) {
        AppUser requester = loadUserByAuthSubject(requesterAuthSubject);
        if (requester.getUserType() != UserType.ADOTANTE) {
            throw new AccessDeniedException("Apenas adotantes podem registrar interesse em animais.");
        }

        Animal animal = loadAnimal(animalId);
        if (animal.getStatus() != AnimalStatus.DISPONIVEL) {
            throw new BadRequestException("Somente animais disponiveis podem receber interesse.");
        }
        AdoptionInterest interest = adoptionInterestRepository
            .findByAnimalIdAndUserId(animalId, requester.getId())
            .orElseGet(AdoptionInterest::new);

        interest.setAnimal(animal);
        interest.setUser(requester);
        interest.setInterestType(request.interestType());

        return toResponse(adoptionInterestRepository.save(interest));
    }

    @Transactional(readOnly = true)
    public List<UUID> listAnimalIdsWithInterests(String requesterAuthSubject) {
        AppUser requester = loadUserByAuthSubject(requesterAuthSubject);
        if (requester.getUserType() == UserType.ADMIN) {
            assertCanApproveAdoptions(requester);
            return adoptionInterestRepository.findDistinctAnimalIdsWithInterests();
        }
        if (requester.getUserType() == UserType.VOLUNTARIO) {
            Organization volunteerOrganization = requester.getOrganization();
            if (volunteerOrganization == null) {
                throw new BadRequestException("Voluntario precisa estar vinculado a uma ONG.");
            }
            return adoptionInterestRepository.findDistinctAnimalIdsWithInterestsByOrganizationId(
                volunteerOrganization.getId()
            );
        }
        throw new AccessDeniedException("Apenas administradores ou voluntarios podem consultar animais com interesse.");
    }

    @Transactional(readOnly = true)
    public List<UUID> listMyAnimalIdsWithInterests(String requesterAuthSubject) {
        AppUser requester = loadUserByAuthSubject(requesterAuthSubject);
        if (requester.getUserType() != UserType.ADOTANTE) {
            throw new AccessDeniedException("Apenas adotantes podem consultar seus interesses.");
        }
        return adoptionInterestRepository.findDistinctAnimalIdsWithInterestsByUserId(
            Objects.requireNonNull(requester.getId())
        );
    }

    @Transactional(readOnly = true)
    public List<AdoptionInterestResponse> listAll(String requesterAuthSubject) {
        AppUser requester = loadUserByAuthSubject(requesterAuthSubject);
        if (requester.getUserType() == UserType.ADMIN) {
            assertCanApproveAdoptions(requester);
            return adoptionInterestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
        }
        if (requester.getUserType() == UserType.VOLUNTARIO) {
            Organization volunteerOrganization = requester.getOrganization();
            if (volunteerOrganization == null) {
                throw new BadRequestException("Voluntario precisa estar vinculado a uma ONG.");
            }
            return adoptionInterestRepository
                .findByAnimalOrganizationIdOrderByCreatedAtDesc(volunteerOrganization.getId())
                .stream()
                .map(this::toResponse)
                .toList();
        }
        throw new AccessDeniedException("Apenas administradores ou voluntarios podem listar intenções de adoção.");
    }

    @Transactional(readOnly = true)
    public List<AdoptionInterestResponse> listByAnimal(UUID animalId, String requesterAuthSubject) {
        AppUser requester = loadUserByAuthSubject(requesterAuthSubject);
        if (requester.getUserType() != UserType.VOLUNTARIO) {
            throw new AccessDeniedException("Apenas voluntarios da ONG podem consultar interessados.");
        }

        Animal animal = loadAnimal(animalId);
        Organization volunteerOrganization = requester.getOrganization();
        if (volunteerOrganization == null) {
            throw new BadRequestException("Voluntario precisa estar vinculado a uma ONG.");
        }

        Organization animalOrganization = animal.getOrganization();
        if (animalOrganization == null || !animalOrganization.getId().equals(volunteerOrganization.getId())) {
            throw new AccessDeniedException("Voluntario so pode consultar interessados de animais da propria ONG.");
        }

        return adoptionInterestRepository.findByAnimalIdOrderByCreatedAtDesc(animalId).stream()
            .map(this::toResponse)
            .toList();
    }

    private AppUser loadUserByAuthSubject(String authSubject) {
        return appUserRepository.findByAuthSubject(authSubject)
            .orElseThrow(() -> new NotFoundException("Usuario autenticado nao encontrado"));
    }

    private void assertCanApproveAdoptions(AppUser requester) {
        AdminPermissions permissions = requester.getAdminPermissions();
        if (permissions == null) {
            permissions = AdminPermissions.fullAccess();
        }
        if (!permissions.allows(AdminPermission.APPROVE_ADOPTIONS)) {
            throw new AccessDeniedException("Administrador sem permissao: APPROVE_ADOPTIONS");
        }
    }

    private Animal loadAnimal(UUID animalId) {
        return animalRepository.findById(Objects.requireNonNull(animalId))
            .orElseThrow(() -> new NotFoundException("Animal nao encontrado"));
    }

    private AdoptionInterestResponse toResponse(AdoptionInterest interest) {
        AppUser user = interest.getUser();
        return new AdoptionInterestResponse(
            Objects.requireNonNull(interest.getId()),
            Objects.requireNonNull(interest.getAnimal().getId()),
            Objects.requireNonNull(user.getId()),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            interest.getInterestType(),
            interest.getCreatedAt(),
            interest.getUpdatedAt()
        );
    }
}
