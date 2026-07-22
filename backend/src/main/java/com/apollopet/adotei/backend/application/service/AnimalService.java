package com.apollopet.adotei.backend.application.service;

import com.apollopet.adotei.backend.application.exception.BadRequestException;
import com.apollopet.adotei.backend.application.exception.NotFoundException;
import com.apollopet.adotei.backend.domain.entity.AdminPermission;
import com.apollopet.adotei.backend.domain.entity.AdminPermissions;
import com.apollopet.adotei.backend.domain.entity.AdoptionRequirement;
import com.apollopet.adotei.backend.domain.entity.Animal;
import com.apollopet.adotei.backend.domain.entity.AnimalAdopterProfile;
import com.apollopet.adotei.backend.domain.entity.AnimalImage;
import com.apollopet.adotei.backend.domain.entity.AnimalStatus;
import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.Organization;
import com.apollopet.adotei.backend.domain.entity.OrganizationPersonality;
import com.apollopet.adotei.backend.domain.entity.TemperamentTrait;
import com.apollopet.adotei.backend.domain.entity.Tutor;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.entity.Vaccine;
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
import com.apollopet.adotei.backend.web.dto.AnimalDtos.AnimalAdopterProfileRequest;
import com.apollopet.adotei.backend.web.dto.AnimalDtos.AnimalAdopterProfileResponse;
import com.apollopet.adotei.backend.web.dto.AnimalDtos.AnimalImageResponse;
import com.apollopet.adotei.backend.web.dto.AnimalDtos.AnimalRequest;
import com.apollopet.adotei.backend.web.dto.AnimalDtos.AnimalResponse;
import jakarta.persistence.EntityManager;
import java.io.IOException;
import java.net.URI;
import java.util.Base64;
import java.util.Objects;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.S3Client;

@Service
public class AnimalService {

    private static final int MAX_IMAGES_PER_ANIMAL = 2;
    private static final Logger log = LoggerFactory.getLogger(AnimalService.class);

    private final AnimalRepository animalRepository;
    private final OrganizationRepository organizationRepository;
    private final TutorRepository tutorRepository;
    private final AppUserRepository appUserRepository;
    private final VaccineRepository vaccineRepository;
    private final TemperamentTraitRepository traitRepository;
    private final AdoptionRequirementRepository requirementRepository;
    private final AnimalAdopterProfileRepository adopterProfileRepository;
    private final AnimalImageRepository imageRepository;
    private final PersonalityService personalityService;
    private final S3Client s3Client;
    private final AwsProperties awsProperties;
    private final Environment environment;
    private final JdbcTemplate jdbcTemplate;

    private final EntityManager entityManager;

    public AnimalService(
        AnimalRepository animalRepository,
        OrganizationRepository organizationRepository,
        TutorRepository tutorRepository,
        AppUserRepository appUserRepository,
        VaccineRepository vaccineRepository,
        TemperamentTraitRepository traitRepository,
        AdoptionRequirementRepository requirementRepository,
        AnimalAdopterProfileRepository adopterProfileRepository,
        AnimalImageRepository imageRepository,
        PersonalityService personalityService,
        S3Client s3Client,
        AwsProperties awsProperties,
        Environment environment,
        EntityManager entityManager,
        JdbcTemplate jdbcTemplate
    ) {
        this.animalRepository = animalRepository;
        this.organizationRepository = organizationRepository;
        this.tutorRepository = tutorRepository;
        this.appUserRepository = appUserRepository;
        this.vaccineRepository = vaccineRepository;
        this.traitRepository = traitRepository;
        this.requirementRepository = requirementRepository;
        this.adopterProfileRepository = adopterProfileRepository;
        this.imageRepository = imageRepository;
        this.personalityService = personalityService;
        this.s3Client = s3Client;
        this.awsProperties = awsProperties;
        this.environment = environment;
        this.entityManager = entityManager;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public List<AnimalResponse> list(String requesterAuthSubject) {
        AppUser requester = loadRequester(requesterAuthSubject);
        if (requester.getUserType() == UserType.ADOTANTE) {
            return animalRepository.findByStatus(AnimalStatus.DISPONIVEL).stream().map(this::toResponse).toList();
        }
        return animalRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AnimalResponse get(UUID id) {
        return toResponse(load(id));
    }

    @Transactional(readOnly = true)
    public ImageBinary getImageBinary(UUID imageId, String requesterAuthSubject) {
        AppUser requester = loadRequester(requesterAuthSubject);
        AnimalImage image = imageRepository.findById(Objects.requireNonNull(imageId))
            .orElseThrow(() -> new NotFoundException("Imagem nao encontrada"));
        assertVolunteerCanManageAnimal(requester, image.getAnimal());

        if (image.getS3Key() != null && image.getS3Key().startsWith("local-inline/")) {
            String fileUrl = image.getFileUrl();
            if (fileUrl == null) {
                throw new NotFoundException("Imagem local invalida");
            }
            int separator = fileUrl.indexOf("base64,");
            if (separator < 0) {
                throw new NotFoundException("Imagem local invalida");
            }
            String base64 = fileUrl.substring(separator + "base64,".length());
            byte[] data = Base64.getDecoder().decode(base64);
            return new ImageBinary(data, image.getContentType());
        }

        GetObjectRequest request = GetObjectRequest.builder()
            .bucket(awsProperties.s3().bucket())
            .key(image.getS3Key())
            .build();
        ResponseBytes<?> bytes = s3Client.getObjectAsBytes(request);
        return new ImageBinary(bytes.asByteArray(), image.getContentType());
    }

    @Transactional
    public AnimalResponse create(AnimalRequest request, String requesterAuthSubject) {
        AppUser requester = loadRequester(requesterAuthSubject);
        assertCanManageAnimals(requester);
        Animal animal = new Animal();
        apply(animal, request, requester);
        animal = Objects.requireNonNull(animalRepository.save(animal));
        upsertAdopterProfile(animal, request.adopterProfile());
        return toResponse(animal);
    }

    @Transactional
    public AnimalResponse update(UUID id, AnimalRequest request, String requesterAuthSubject) {
        AppUser requester = loadRequester(requesterAuthSubject);
        assertCanManageAnimals(requester);
        Animal animal = load(id);
        assertVolunteerCanManageAnimal(requester, animal);
        apply(animal, request, requester);
        animal = Objects.requireNonNull(animalRepository.save(Objects.requireNonNull(animal)));
        upsertAdopterProfile(animal, request.adopterProfile());
        return toResponse(animal);
    }

    @Transactional
    public AnimalResponse updateStatus(UUID id, AnimalStatus status, String requesterAuthSubject) {
        AppUser requester = loadRequester(requesterAuthSubject);
        assertCanManageAnimals(requester);
        Animal animal = load(id);
        assertVolunteerCanManageAnimal(requester, animal);
        animal.setStatus(status);
        animal = Objects.requireNonNull(animalRepository.save(animal));
        return toResponse(animal);
    }

    @Transactional
    public void delete(UUID id, String requesterAuthSubject) {
        AppUser requester = loadRequester(requesterAuthSubject);
        assertCanManageAnimals(requester);
        Animal animal = load(id);
        assertVolunteerCanManageAnimal(requester, animal);
        // Detach managed graph to avoid flush cascading transient references unrelated to the delete itself.
        entityManager.clear();
        int affectedRows = jdbcTemplate.update("delete from animal where id = ?", id);
        if (affectedRows == 0) {
            throw new NotFoundException("Animal nao encontrado");
        }
    }

    @Transactional
    public AnimalImageResponse uploadImage(UUID animalId, String requesterAuthSubject, MultipartFile file, Integer displayOrder) {
        AppUser requester = loadRequester(requesterAuthSubject);
        assertCanManageAnimals(requester);
        Animal animal = load(animalId);
        assertVolunteerCanManageAnimal(requester, animal);
        long existing = imageRepository.countByAnimalId(animalId);
        if (existing >= MAX_IMAGES_PER_ANIMAL) {
            throw new BadRequestException("Animal ja possui o numero maximo de imagens");
        }

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Arquivo de imagem obrigatorio");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Apenas arquivos de imagem sao permitidos");
        }

        String originalFilename = file.getOriginalFilename();
        String sanitizedFileName = originalFilename == null
            ? UUID.randomUUID() + ".jpg"
            : originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String key = "animals/%s/%s-%s".formatted(animalId, UUID.randomUUID(), sanitizedFileName);
        String bucket = awsProperties.s3().bucket();

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
            .bucket(bucket)
            .key(key)
            .contentType(contentType)
            .build();

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Falha ao processar imagem enviada");
        }

        String storedKey = key;
        String fileUrl;
        try {
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileBytes));
            fileUrl = buildPublicUrl(bucket, key);
        } catch (Exception e) {
            if (!isLocalProfile()) {
                log.error(
                    "Falha ao enviar imagem para S3. bucket={} key={} region={} endpoint={} publicEndpoint={}",
                    bucket,
                    key,
                    awsProperties.region(),
                    awsProperties.s3().endpoint(),
                    awsProperties.s3().publicEndpoint(),
                    e
                );
                throw new BadRequestException(
                    "Falha ao enviar imagem para o S3. Verifique S3_ACCESS_KEY, S3_SECRET_KEY e S3_BUCKET."
                );
            }
            storedKey = "local-inline/%s".formatted(UUID.randomUUID());
            fileUrl = "data:%s;base64,%s".formatted(contentType, Base64.getEncoder().encodeToString(fileBytes));
        }

        AnimalImage image = new AnimalImage();
        image.setAnimal(animal);
        image.setS3Key(storedKey);
        image.setContentType(contentType);
        image.setDisplayOrder(displayOrder == null ? 0 : displayOrder);
        image.setFileUrl(fileUrl);
        image = imageRepository.save(image);

        return new AnimalImageResponse(
            image.getId(),
            image.getFileUrl(),
            image.getContentType(),
            image.getDisplayOrder()
        );
    }

    @Transactional
    public void deleteImage(UUID animalId, UUID imageId, String requesterAuthSubject) {
        AppUser requester = loadRequester(requesterAuthSubject);
        assertCanManageAnimals(requester);
        Animal animal = load(animalId);
        assertVolunteerCanManageAnimal(requester, animal);

        AnimalImage image = imageRepository.findById(Objects.requireNonNull(imageId))
            .orElseThrow(() -> new NotFoundException("Imagem nao encontrada"));

        if (!Objects.equals(image.getAnimal().getId(), animalId)) {
            throw new BadRequestException("Imagem nao pertence ao animal informado");
        }

        if (image.getS3Key() != null && !image.getS3Key().startsWith("local-inline/")) {
            try {
                DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(awsProperties.s3().bucket())
                    .key(image.getS3Key())
                    .build();
                s3Client.deleteObject(deleteRequest);
            } catch (Exception e) {
                log.warn("Falha ao remover imagem no S3. imageId={} s3Key={}", imageId, image.getS3Key(), e);
            }
        }

        imageRepository.delete(image);
    }

    private String buildPublicUrl(String bucket, String key) {
        String base = publicEndpointBase();
        if (base != null) {
            // Railway "s3-public-presigner" template expects the URL path to be the object key only.
            // Example: https://<presigner-app>.up.railway.app/duck.png
            if (isPublicBucketPresigner(base)) {
                return base + "/" + key;
            }
            return base + "/" + bucket + "/" + key;
        }
        return "https://%s.s3.%s.amazonaws.com/%s".formatted(bucket, awsProperties.region(), key);
    }

    private static boolean isPublicBucketPresigner(String base) {
        try {
            String host = URI.create(base).getHost();
            if (host == null) {
                return false;
            }
            return host.contains("s3-public-presigner");
        } catch (Exception e) {
            return false;
        }
    }

    private String publicEndpointBase() {
        if (awsProperties.s3().publicEndpoint() != null && !awsProperties.s3().publicEndpoint().isBlank()) {
            return URI.create(awsProperties.s3().publicEndpoint()).toString();
        }
        if (awsProperties.s3().endpoint() != null && !awsProperties.s3().endpoint().isBlank()) {
            return URI.create(awsProperties.s3().endpoint()).toString();
        }
        return null;
    }

    private boolean isLocalProfile() {
        return environment.acceptsProfiles(Profiles.of("local"));
    }

    public record ImageBinary(byte[] data, String contentType) {
    }

    private Animal load(UUID id) {
        return animalRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new NotFoundException("Animal nao encontrado"));
    }

    private void apply(Animal animal, AnimalRequest request, AppUser requester) {
        validateCatalogValues(request);
        animal.setName(request.name());
        animal.setAnimalType(request.animalType());
        animal.setBreed(request.breed());
        animal.setAgeYears(request.ageYears());
        animal.setSex(request.sex());
        animal.setSize(request.size());
        animal.setSterilized(request.sterilized());
        animal.setVaccinationStatus(request.vaccinationStatus());
        animal.setVeterinaryInfo(request.veterinaryInfo());
        animal.setHealthConditions(request.healthConditions());
        animal.setSpecialNeeds(request.specialNeeds());
        animal.setSpecialNeedsDescription(request.specialNeedsDescription());
        animal.setGoodWithChildren(request.goodWithChildren());
        animal.setGoodWithOtherAnimals(request.goodWithOtherAnimals());
        animal.setGoodWithSeniors(request.goodWithSeniors());
        animal.setEnergyLevel(request.energyLevel());
        animal.setTrainability(request.trainability());
        animal.setLocation(request.location());
        animal.setResponsibleName(request.responsibleName());
        animal.setResponsibleContact(request.responsibleContact());
        animal.setTutorName(request.tutorName());
        animal.setTutorContact(request.tutorContact());
        animal.setAdditionalInfo(request.additionalInfo());
        if (request.status() != null) {
            animal.setStatus(request.status());
        } else if (animal.getStatus() == null) {
            animal.setStatus(AnimalStatus.DISPONIVEL);
        }

        Organization organization = resolveOrganization(request.organizationId());
        animal.setTutor(resolveTutor(request.tutorId()));
        AppUser createdBy = requester;
        if (requester != null && requester.getUserType() == UserType.VOLUNTARIO) {
            if (requester.getOrganization() == null) {
                throw new BadRequestException("Voluntario precisa estar vinculado a uma ONG para cadastrar animal.");
            }
            if (organization == null) {
                organization = requester.getOrganization();
            } else if (!organization.getId().equals(requester.getOrganization().getId())) {
                throw new BadRequestException("Voluntario so pode cadastrar animais para sua propria ONG.");
            }
        }
        animal.setOrganization(organization);
        animal.setCreatedBy(createdBy);

        OrganizationPersonality personality = personalityService.loadForAnimal(request.personalityId(), organization);
        animal.setPersonality(personality);
        animal.setDescription(personality.getDescription());
        animal.setPersonalityTemperament(personality.getName());

        animal.setVaccines(resolveVaccines(request.vaccineIds()));
        animal.setTemperamentTraits(resolveTraits(request.temperamentTraitIds()));
        animal.setRequirements(resolveRequirements(request.requirementIds()));
    }

    private void validateCatalogValues(AnimalRequest request) {
        if (!Set.of("cachorro", "gato").contains(request.animalType())) {
            throw new BadRequestException("Tipo de animal invalido. Use cachorro ou gato.");
        }
        if (!Set.of("macho", "femea").contains(request.sex())) {
            throw new BadRequestException("Sexo invalido. Use macho ou femea.");
        }
        if (!Set.of("pequeno", "medio", "grande").contains(request.size())) {
            throw new BadRequestException("Porte invalido. Use pequeno, medio ou grande.");
        }
    }

    private void upsertAdopterProfile(Animal animal, AnimalAdopterProfileRequest request) {
        if (request == null) {
            return;
        }
        AnimalAdopterProfile profile = adopterProfileRepository.findByAnimalId(animal.getId())
            .orElseGet(AnimalAdopterProfile::new);
        profile.setAnimal(animal);
        profile.setSuitableHousing(request.suitableHousing() == null ? null : String.join(",", request.suitableHousing()));
        profile.setRequiresYard(request.requiresYard());
        profile.setRequiresWalledYard(request.requiresWalledYard());
        profile.setRequiresWindowScreens(request.requiresWindowScreens());
        profile.setAllowsRented(request.allowsRented());
        profile.setMinResidentExperience(request.minResidentExperience());
        profile.setSuitableForChildren(request.suitableForChildren());
        profile.setSuitableForFirstTimers(request.suitableForFirstTimers());
        profile.setMaxHoursAloneDaily(request.maxHoursAloneDaily());
        profile.setEstimatedMonthlyCost(request.estimatedMonthlyCost());
        profile.setRequiresEmergencyBudget(request.requiresEmergencyBudget());
        adopterProfileRepository.save(profile);
    }

    private Organization resolveOrganization(UUID id) {
        if (id == null) {
            return null;
        }
        return organizationRepository.findById(id).orElseThrow(() -> new NotFoundException("Organizacao nao encontrada"));
    }

    private Tutor resolveTutor(UUID id) {
        if (id == null) {
            return null;
        }
        return tutorRepository.findById(id).orElseThrow(() -> new NotFoundException("Tutor nao encontrado"));
    }

    private AppUser loadRequester(String authSubject) {
        return appUserRepository.findByAuthSubject(authSubject)
            .orElseThrow(() -> new NotFoundException("Usuario autenticado nao encontrado"));
    }

    private void assertCanManageAnimals(AppUser requester) {
        if (requester.getUserType() != UserType.ADMIN) {
            return;
        }
        AdminPermissions permissions = requester.getAdminPermissions();
        if (permissions == null) {
            permissions = AdminPermissions.fullAccess();
        }
        if (!permissions.allows(AdminPermission.MANAGE_ANIMALS)) {
            throw new AccessDeniedException("Administrador sem permissao: MANAGE_ANIMALS");
        }
    }

    private void assertVolunteerCanManageAnimal(AppUser requester, Animal animal) {
        if (requester.getUserType() != UserType.VOLUNTARIO) {
            return;
        }
        if (requester.getOrganization() == null) {
            throw new AccessDeniedException("Voluntario sem ONG vinculada.");
        }
        if (animal.getOrganization() == null) {
            throw new AccessDeniedException("Animal sem ONG vinculada.");
        }
        if (!requester.getOrganization().getId().equals(animal.getOrganization().getId())) {
            throw new AccessDeniedException("Voluntario so pode gerenciar animais da propria ONG.");
        }
    }

    private Set<Vaccine> resolveVaccines(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(vaccineRepository.findAllById(ids));
    }

    private Set<TemperamentTrait> resolveTraits(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(traitRepository.findAllById(ids));
    }

    private Set<AdoptionRequirement> resolveRequirements(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(requirementRepository.findAllById(ids));
    }

    private AnimalResponse toResponse(Animal animal) {
        List<AnimalImageResponse> imageResponses = imageRepository.findByAnimalIdOrderByDisplayOrderAsc(animal.getId()).stream()
            .map(image -> new AnimalImageResponse(image.getId(), image.getFileUrl(), image.getContentType(), image.getDisplayOrder()))
            .toList();
        AnimalAdopterProfileResponse adopterProfileResponse = adopterProfileRepository.findByAnimalId(animal.getId())
            .map(this::toAdopterProfileResponse)
            .orElse(null);

        return new AnimalResponse(
            animal.getId(),
            animal.getName(),
            animal.getAnimalType(),
            animal.getBreed(),
            animal.getAgeYears(),
            animal.getSex(),
            animal.getSize(),
            animal.getDescription(),
            animal.isSterilized(),
            animal.getVaccinationStatus(),
            animal.getVeterinaryInfo(),
            animal.getHealthConditions(),
            animal.isSpecialNeeds(),
            animal.getSpecialNeedsDescription(),
            animal.isGoodWithChildren(),
            animal.isGoodWithOtherAnimals(),
            animal.isGoodWithSeniors(),
            animal.getEnergyLevel(),
            animal.getTrainability(),
            animal.getLocation(),
            animal.getResponsibleName(),
            animal.getResponsibleContact(),
            animal.getTutorName(),
            animal.getTutorContact(),
            animal.getPersonalityTemperament(),
            animal.getAdditionalInfo(),
            animal.getStatus(),
            animal.getOrganization() == null ? null : animal.getOrganization().getId(),
            animal.getPersonality() == null ? null : animal.getPersonality().getId(),
            animal.getPersonality() == null ? null : animal.getPersonality().getName(),
            animal.getTutor() == null ? null : animal.getTutor().getId(),
            animal.getVaccines().stream().map(Vaccine::getId).toList(),
            animal.getVaccines().stream().map(Vaccine::getName).sorted().toList(),
            animal.getTemperamentTraits().stream().map(TemperamentTrait::getId).toList(),
            animal.getRequirements().stream().map(AdoptionRequirement::getId).toList(),
            adopterProfileResponse,
            imageResponses,
            animal.getCreatedAt()
        );
    }

    private AnimalAdopterProfileResponse toAdopterProfileResponse(AnimalAdopterProfile profile) {
        List<String> suitableHousing = profile.getSuitableHousing() == null || profile.getSuitableHousing().isBlank()
            ? List.of()
            : Arrays.stream(profile.getSuitableHousing().split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();

        return new AnimalAdopterProfileResponse(
            suitableHousing,
            profile.isRequiresYard(),
            profile.isRequiresWalledYard(),
            profile.isRequiresWindowScreens(),
            profile.isAllowsRented(),
            profile.getMinResidentExperience(),
            profile.isSuitableForChildren(),
            profile.isSuitableForFirstTimers(),
            profile.getMaxHoursAloneDaily(),
            profile.getEstimatedMonthlyCost(),
            profile.isRequiresEmergencyBudget()
        );
    }
}
