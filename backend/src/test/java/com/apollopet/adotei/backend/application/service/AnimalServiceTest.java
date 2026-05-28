package com.apollopet.adotei.backend.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.apollopet.adotei.backend.application.exception.BadRequestException;
import com.apollopet.adotei.backend.domain.entity.Animal;
import com.apollopet.adotei.backend.domain.entity.AnimalStatus;
import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AdoptionRequirementRepository;
import com.apollopet.adotei.backend.domain.repository.AnimalAdopterProfileRepository;
import com.apollopet.adotei.backend.domain.repository.AnimalImageRepository;
import com.apollopet.adotei.backend.domain.repository.AnimalRepository;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import com.apollopet.adotei.backend.domain.repository.OrganizationRepository;
import com.apollopet.adotei.backend.domain.repository.TemperamentTraitRepository;
import com.apollopet.adotei.backend.domain.repository.TutorRepository;
import com.apollopet.adotei.backend.domain.repository.VaccineRepository;
import com.apollopet.adotei.backend.infrastructure.config.AwsProperties;
import java.util.Optional;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import software.amazon.awssdk.services.s3.S3Client;

@ExtendWith(MockitoExtension.class)
class AnimalServiceTest {

    @Mock private AnimalRepository animalRepository;
    @Mock private OrganizationRepository organizationRepository;
    @Mock private TutorRepository tutorRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private VaccineRepository vaccineRepository;
    @Mock private TemperamentTraitRepository traitRepository;
    @Mock private AdoptionRequirementRepository requirementRepository;
    @Mock private AnimalAdopterProfileRepository adopterProfileRepository;
    @Mock private AnimalImageRepository imageRepository;
    @Mock private S3Client s3Client;
    @Mock private Environment environment;

    private AnimalService animalService;

    @BeforeEach
    void setUp() {
        AwsProperties awsProperties = new AwsProperties(
            "us-east-1",
            new AwsProperties.S3Properties("bucket", "", "", "key", "secret", 15L)
        );
        animalService = new AnimalService(
            animalRepository,
            organizationRepository,
            tutorRepository,
            appUserRepository,
            vaccineRepository,
            traitRepository,
            requirementRepository,
            adopterProfileRepository,
            imageRepository,
            s3Client,
            awsProperties,
            environment
        );
    }

    @Test
    void deveFalharQuandoAnimalJaPossuiDuasImagens() {
        UUID animalId = UUID.randomUUID();
        Animal animal = new Animal();
        AppUser requester = new AppUser();
        requester.setUserType(UserType.ADMIN);

        when(animalRepository.findById(animalId)).thenReturn(Optional.of(animal));
        when(appUserRepository.findByAuthSubject("admin-auth")).thenReturn(Optional.of(requester));
        when(imageRepository.countByAnimalId(animalId)).thenReturn(2L);

        assertThrows(BadRequestException.class, () -> animalService.uploadImage(animalId, "admin-auth", null, 0));
    }

    @Test
    void deveListarSomenteAnimaisDisponiveisParaAdotante() {
        AppUser adopter = new AppUser();
        adopter.setUserType(UserType.ADOTANTE);
        UUID adopterId = UUID.randomUUID();
        setEntityId(adopter, adopterId);

        Animal available = new Animal();
        available.setName("Rex");
        available.setStatus(AnimalStatus.DISPONIVEL);
        setEntityId(available, UUID.randomUUID());

        when(appUserRepository.findByAuthSubject("adopter-auth")).thenReturn(Optional.of(adopter));
        when(animalRepository.findByStatus(AnimalStatus.DISPONIVEL)).thenReturn(List.of(available));
        when(imageRepository.findByAnimalIdOrderByDisplayOrderAsc(any(UUID.class))).thenReturn(List.of());
        when(adopterProfileRepository.findByAnimalId(any(UUID.class))).thenReturn(Optional.empty());

        var response = animalService.list("adopter-auth");

        assertEquals(1, response.size());
        assertEquals(AnimalStatus.DISPONIVEL, response.get(0).status());
        verify(animalRepository, never()).findAll();
    }

    @Test
    void deveExcluirAnimalQuandoSolicitanteTemPermissao() {
        UUID animalId = UUID.randomUUID();
        AppUser admin = new AppUser();
        admin.setUserType(UserType.ADMIN);

        Animal animal = new Animal();
        animal.setName("Luna");
        setEntityId(animal, animalId);

        when(appUserRepository.findByAuthSubject("admin-auth")).thenReturn(Optional.of(admin));
        when(animalRepository.findById(animalId)).thenReturn(Optional.of(animal));

        animalService.delete(animalId, "admin-auth");

        verify(animalRepository).delete(animal);
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
