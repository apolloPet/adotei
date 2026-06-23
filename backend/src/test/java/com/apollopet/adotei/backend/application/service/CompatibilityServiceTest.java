package com.apollopet.adotei.backend.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.apollopet.adotei.backend.domain.entity.AdopterProfile;
import com.apollopet.adotei.backend.domain.entity.Animal;
import com.apollopet.adotei.backend.domain.entity.AnimalAdopterProfile;
import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AdopterProfileRepository;
import com.apollopet.adotei.backend.domain.repository.AnimalAdopterProfileRepository;
import com.apollopet.adotei.backend.domain.repository.AnimalRepository;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
class CompatibilityServiceTest {

    @Mock private AnimalRepository animalRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private AdopterProfileRepository adopterProfileRepository;
    @Mock private AnimalAdopterProfileRepository animalAdopterProfileRepository;

    @Test
    void deveCalcularScorePorPerguntasRespondidas() {
        CompatibilityService service = new CompatibilityService(
            animalRepository,
            appUserRepository,
            adopterProfileRepository,
            animalAdopterProfileRepository
        );

        UUID animalId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Animal animal = new Animal();
        setEntityId(animal, animalId);
        AppUser requester = new AppUser();
        requester.setUserType(UserType.ADOTANTE);
        setEntityId(requester, userId);

        AppUser adoptedUser = new AppUser();
        setEntityId(adoptedUser, userId);

        AdopterProfile adopterProfile = new AdopterProfile();
        adopterProfile.setHasYard(true);
        adopterProfile.setYardWalled(false);
        adopterProfile.setHasWindowScreens(true);
        adopterProfile.setOwnershipType("rented");
        adopterProfile.setRentAllowsPets(true);
        adopterProfile.setHasChildren(true);
        adopterProfile.setHadPetsBefore(false);
        adopterProfile.setWillCoverEmergencies(true);
        adopterProfile.setHoursAloneDaily(4);
        adopterProfile.setMonthlyBudget("300-600");

        AnimalAdopterProfile animalProfile = new AnimalAdopterProfile();
        animalProfile.setRequiresYard(true);
        animalProfile.setRequiresWalledYard(true);
        animalProfile.setRequiresWindowScreens(true);
        animalProfile.setAllowsRented(true);
        animalProfile.setSuitableForChildren(true);
        animalProfile.setSuitableForFirstTimers(true);
        animalProfile.setRequiresEmergencyBudget(true);
        animalProfile.setMaxHoursAloneDaily(6);
        animalProfile.setEstimatedMonthlyCost("300-600");

        when(appUserRepository.findByAuthSubject("auth-user")).thenReturn(Optional.of(requester));
        when(animalRepository.findById(animalId)).thenReturn(Optional.of(animal));
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(adoptedUser));
        when(adopterProfileRepository.findByUserId(userId)).thenReturn(Optional.of(adopterProfile));
        when(animalAdopterProfileRepository.findByAnimalId(animalId)).thenReturn(Optional.of(animalProfile));

        var response = service.score(animalId, userId, "auth-user");

        assertEquals(89, response.scorePercent());
        assertEquals(8, response.matchedCount());
        assertEquals(9, response.totalAnsweredCount());
    }

    @Test
    void deveListarCandidatosOrdenadosPorScore() {
        CompatibilityService service = new CompatibilityService(
            animalRepository,
            appUserRepository,
            adopterProfileRepository,
            animalAdopterProfileRepository
        );

        UUID animalId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Animal animal = new Animal();
        setEntityId(animal, animalId);

        AppUser admin = new AppUser();
        admin.setUserType(UserType.ADMIN);
        admin.setFullName("Admin");
        setEntityId(admin, UUID.randomUUID());

        AppUser adopter = new AppUser();
        adopter.setUserType(UserType.ADOTANTE);
        adopter.setFullName("Adotante Teste");
        adopter.setEmail("adotante01@adotei.com");
        adopter.setCity("Sao Paulo");
        setEntityId(adopter, userId);

        AdopterProfile adopterProfile = new AdopterProfile();
        adopterProfile.setUser(adopter);
        adopterProfile.setHasYard(true);
        adopterProfile.setHadPetsBefore(true);
        adopterProfile.setWillCoverEmergencies(true);
        adopterProfile.setMonthlyBudget("300-600");

        AnimalAdopterProfile animalProfile = new AnimalAdopterProfile();
        animalProfile.setRequiresYard(true);
        animalProfile.setSuitableForFirstTimers(true);
        animalProfile.setRequiresEmergencyBudget(true);
        animalProfile.setEstimatedMonthlyCost("300-600");

        when(appUserRepository.findByAuthSubject("admin-auth")).thenReturn(Optional.of(admin));
        when(animalRepository.findById(animalId)).thenReturn(Optional.of(animal));
        when(animalAdopterProfileRepository.findByAnimalId(animalId)).thenReturn(Optional.of(animalProfile));
        when(adopterProfileRepository.findAllByUser_UserType(UserType.ADOTANTE)).thenReturn(List.of(adopterProfile));
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(adopter));
        when(adopterProfileRepository.findByUserId(userId)).thenReturn(Optional.of(adopterProfile));

        var candidates = service.listCandidates(animalId, "admin-auth");

        assertEquals(1, candidates.size());
        assertEquals("Adotante Teste", candidates.get(0).fullName());
        assertEquals("adotante01@adotei.com", candidates.get(0).email());
        assertEquals(userId, candidates.get(0).userId());
    }

    @Test
    void deveBloquearAdotanteConsultandoOutroUsuario() {
        CompatibilityService service = new CompatibilityService(
            animalRepository,
            appUserRepository,
            adopterProfileRepository,
            animalAdopterProfileRepository
        );

        UUID requestedUserId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();

        AppUser requester = new AppUser();
        requester.setUserType(UserType.ADOTANTE);
        setEntityId(requester, requesterId);

        when(appUserRepository.findByAuthSubject("auth-user")).thenReturn(Optional.of(requester));

        assertThrows(
            AccessDeniedException.class,
            () -> service.score(UUID.randomUUID(), requestedUserId, "auth-user")
        );
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
