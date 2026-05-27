package com.apollopet.adotei.backend.application.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.apollopet.adotei.backend.application.exception.BadRequestException;
import com.apollopet.adotei.backend.domain.entity.Animal;
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
}
