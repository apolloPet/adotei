package com.apollopet.adotei.backend.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.apollopet.adotei.backend.application.exception.BadRequestException;
import com.apollopet.adotei.backend.domain.entity.AdoptionInterest;
import com.apollopet.adotei.backend.domain.entity.Animal;
import com.apollopet.adotei.backend.domain.entity.AnimalStatus;
import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.InterestType;
import com.apollopet.adotei.backend.domain.entity.Organization;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AdoptionInterestRepository;
import com.apollopet.adotei.backend.domain.repository.AnimalRepository;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import com.apollopet.adotei.backend.web.dto.AdoptionInterestDtos.RegisterAdoptionInterestRequest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
class AdoptionInterestServiceTest {

    @Mock private AdoptionInterestRepository adoptionInterestRepository;
    @Mock private AnimalRepository animalRepository;
    @Mock private AppUserRepository appUserRepository;

    @Test
    void deveRegistrarInteresseComoAdotante() {
        AdoptionInterestService service = new AdoptionInterestService(
            adoptionInterestRepository,
            animalRepository,
            appUserRepository
        );

        UUID animalId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        AppUser adopter = buildUser(UserType.ADOTANTE, null, userId);
        Animal animal = buildAnimal(animalId, null);

        when(appUserRepository.findByAuthSubject("adopter-auth")).thenReturn(Optional.of(adopter));
        when(animalRepository.findById(animalId)).thenReturn(Optional.of(animal));
        when(adoptionInterestRepository.findByAnimalIdAndUserId(animalId, userId)).thenReturn(Optional.empty());
        when(adoptionInterestRepository.save(any(AdoptionInterest.class))).thenAnswer(invocation -> {
            AdoptionInterest saved = invocation.getArgument(0);
            saved.prePersist();
            return saved;
        });

        var response = service.register(
            animalId,
            "adopter-auth",
            new RegisterAdoptionInterestRequest(InterestType.LIKED)
        );

        assertEquals(InterestType.LIKED, response.interestType());
        assertEquals(userId, response.userId());
        assertEquals(animalId, response.animalId());
    }

    @Test
    void deveAtualizarInteresseExistente() {
        AdoptionInterestService service = new AdoptionInterestService(
            adoptionInterestRepository,
            animalRepository,
            appUserRepository
        );

        UUID animalId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        AppUser adopter = buildUser(UserType.ADOTANTE, null, userId);
        Animal animal = buildAnimal(animalId, null);
        AdoptionInterest existing = new AdoptionInterest();
        existing.setAnimal(animal);
        existing.setUser(adopter);
        existing.setInterestType(InterestType.LIKED);
        setEntityId(existing, UUID.randomUUID());

        when(appUserRepository.findByAuthSubject("adopter-auth")).thenReturn(Optional.of(adopter));
        when(animalRepository.findById(animalId)).thenReturn(Optional.of(animal));
        when(adoptionInterestRepository.findByAnimalIdAndUserId(animalId, userId)).thenReturn(Optional.of(existing));
        when(adoptionInterestRepository.save(existing)).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.register(
            animalId,
            "adopter-auth",
            new RegisterAdoptionInterestRequest(InterestType.SAVED)
        );

        assertEquals(InterestType.SAVED, response.interestType());
        ArgumentCaptor<AdoptionInterest> captor = ArgumentCaptor.forClass(AdoptionInterest.class);
        verify(adoptionInterestRepository).save(captor.capture());
        assertEquals(InterestType.SAVED, captor.getValue().getInterestType());
    }

    @Test
    void deveListarInteressadosParaVoluntarioDaMesmaOng() {
        AdoptionInterestService service = new AdoptionInterestService(
            adoptionInterestRepository,
            animalRepository,
            appUserRepository
        );

        UUID animalId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        Organization org = buildOrganization(orgId);

        AppUser volunteer = buildUser(UserType.VOLUNTARIO, org, UUID.randomUUID());
        Animal animal = buildAnimal(animalId, org);
        AdoptionInterest interest = new AdoptionInterest();
        interest.setAnimal(animal);
        interest.setUser(buildUser(UserType.ADOTANTE, null, UUID.randomUUID()));
        interest.setInterestType(InterestType.LIKED);
        interest.prePersist();

        when(appUserRepository.findByAuthSubject("volunteer-auth")).thenReturn(Optional.of(volunteer));
        when(animalRepository.findById(animalId)).thenReturn(Optional.of(animal));
        when(adoptionInterestRepository.findByAnimalIdOrderByCreatedAtDesc(animalId)).thenReturn(List.of(interest));

        var responses = service.listByAnimal(animalId, "volunteer-auth");

        assertEquals(1, responses.size());
        assertEquals(InterestType.LIKED, responses.get(0).interestType());
    }

    @Test
    void deveBloquearVoluntarioDeOutraOng() {
        AdoptionInterestService service = new AdoptionInterestService(
            adoptionInterestRepository,
            animalRepository,
            appUserRepository
        );

        UUID animalId = UUID.randomUUID();
        Organization volunteerOrg = buildOrganization(UUID.randomUUID());
        Organization animalOrg = buildOrganization(UUID.randomUUID());

        AppUser volunteer = buildUser(UserType.VOLUNTARIO, volunteerOrg, UUID.randomUUID());
        Animal animal = buildAnimal(animalId, animalOrg);

        when(appUserRepository.findByAuthSubject("volunteer-auth")).thenReturn(Optional.of(volunteer));
        when(animalRepository.findById(animalId)).thenReturn(Optional.of(animal));

        assertThrows(
            AccessDeniedException.class,
            () -> service.listByAnimal(animalId, "volunteer-auth")
        );
    }

    @Test
    void deveListarIdsDeAnimaisComInteresseDaOngDoVoluntario() {
        AdoptionInterestService service = new AdoptionInterestService(
            adoptionInterestRepository,
            animalRepository,
            appUserRepository
        );

        UUID orgId = UUID.randomUUID();
        UUID animalId = UUID.randomUUID();
        Organization org = buildOrganization(orgId);
        AppUser volunteer = buildUser(UserType.VOLUNTARIO, org, UUID.randomUUID());

        when(appUserRepository.findByAuthSubject("volunteer-auth")).thenReturn(Optional.of(volunteer));
        when(adoptionInterestRepository.findDistinctAnimalIdsWithInterestsByOrganizationId(orgId))
            .thenReturn(List.of(animalId));

        var ids = service.listAnimalIdsWithInterests("volunteer-auth");

        assertEquals(1, ids.size());
        assertEquals(animalId, ids.get(0));
    }

    @Test
    void deveBloquearRegistroPorAdministrador() {
        AdoptionInterestService service = new AdoptionInterestService(
            adoptionInterestRepository,
            animalRepository,
            appUserRepository
        );

        AppUser admin = buildUser(UserType.ADMIN, null, UUID.randomUUID());
        when(appUserRepository.findByAuthSubject("admin-auth")).thenReturn(Optional.of(admin));

        AccessDeniedException ex = assertThrows(
            AccessDeniedException.class,
            () -> service.register(
                UUID.randomUUID(),
                "admin-auth",
                new RegisterAdoptionInterestRequest(InterestType.LIKED)
            )
        );
        assertEquals("Apenas adotantes podem registrar interesse em animais.", ex.getMessage());
    }

    @Test
    void deveBloquearRegistroPorNaoAdotante() {
        AdoptionInterestService service = new AdoptionInterestService(
            adoptionInterestRepository,
            animalRepository,
            appUserRepository
        );

        AppUser volunteer = buildUser(UserType.VOLUNTARIO, buildOrganization(UUID.randomUUID()), UUID.randomUUID());
        when(appUserRepository.findByAuthSubject("volunteer-auth")).thenReturn(Optional.of(volunteer));

        assertThrows(
            AccessDeniedException.class,
            () -> service.register(
                UUID.randomUUID(),
                "volunteer-auth",
                new RegisterAdoptionInterestRequest(InterestType.LIKED)
            )
        );
    }

    @Test
    void deveBloquearInteresseEmAnimalNaoDisponivel() {
        AdoptionInterestService service = new AdoptionInterestService(
            adoptionInterestRepository,
            animalRepository,
            appUserRepository
        );

        UUID animalId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        AppUser adopter = buildUser(UserType.ADOTANTE, null, userId);
        Animal animal = buildAnimal(animalId, null);
        animal.setStatus(AnimalStatus.ADOTADO);

        when(appUserRepository.findByAuthSubject("adopter-auth")).thenReturn(Optional.of(adopter));
        when(animalRepository.findById(animalId)).thenReturn(Optional.of(animal));

        assertThrows(
            BadRequestException.class,
            () -> service.register(
                animalId,
                "adopter-auth",
                new RegisterAdoptionInterestRequest(InterestType.LIKED)
            )
        );
    }

    @Test
    void deveListarMeusAnimaisComInteresseParaAdotante() {
        AdoptionInterestService service = new AdoptionInterestService(
            adoptionInterestRepository,
            animalRepository,
            appUserRepository
        );

        UUID userId = UUID.randomUUID();
        UUID animalId = UUID.randomUUID();
        AppUser adopter = buildUser(UserType.ADOTANTE, null, userId);

        when(appUserRepository.findByAuthSubject("adopter-auth")).thenReturn(Optional.of(adopter));
        when(adoptionInterestRepository.findDistinctAnimalIdsWithInterestsByUserId(userId)).thenReturn(List.of(animalId));

        var ids = service.listMyAnimalIdsWithInterests("adopter-auth");

        assertEquals(1, ids.size());
        assertEquals(animalId, ids.get(0));
    }

    private AppUser buildUser(UserType userType, Organization organization, UUID id) {
        AppUser user = new AppUser();
        user.setUserType(userType);
        user.setOrganization(organization);
        user.setFullName("Usuario Teste");
        user.setEmail("teste@adotei.com");
        user.setPhone("(11) 99999-9999");
        user.setAuthSubject("auth-" + id);
        setEntityId(user, id);
        return user;
    }

    private Animal buildAnimal(UUID animalId, Organization organization) {
        Animal animal = new Animal();
        animal.setOrganization(organization);
        animal.setName("Rex");
        animal.setStatus(AnimalStatus.DISPONIVEL);
        setEntityId(animal, animalId);
        return animal;
    }

    private Organization buildOrganization(UUID id) {
        Organization organization = new Organization();
        organization.setLegalName("ONG Teste");
        organization.setPrimaryContactName("Contato");
        organization.setContactPhone1("(11) 99999-9999");
        organization.setCity("São Paulo");
        setEntityId(organization, id);
        return organization;
    }

    private void setEntityId(Object entity, UUID id) {
        try {
            var field = entity.getClass().getSuperclass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception ignored) {
            // helper for tests
        }
    }
}
