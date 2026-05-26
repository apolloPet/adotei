package com.apollopet.adotei.backend.application.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.apollopet.adotei.backend.application.exception.BadRequestException;
import com.apollopet.adotei.backend.domain.entity.Animal;
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
import com.apollopet.adotei.backend.web.dto.AnimalDtos.GenerateImageUploadRequest;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

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
    @Mock private S3Presigner s3Presigner;

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
            s3Presigner,
            awsProperties
        );
    }

    @Test
    void deveFalharQuandoAnimalJaPossuiDuasImagens() {
        UUID animalId = UUID.randomUUID();
        Animal animal = new Animal();

        when(animalRepository.findById(animalId)).thenReturn(Optional.of(animal));
        when(imageRepository.countByAnimalId(animalId)).thenReturn(2L);

        GenerateImageUploadRequest request = new GenerateImageUploadRequest("foto.jpg", "image/jpeg", 0);

        assertThrows(BadRequestException.class, () -> animalService.generateUpload(animalId, request));
    }
}
