package com.apollopet.adotei.backend.infrastructure.config;

import com.apollopet.adotei.backend.domain.entity.AdopterProfile;
import com.apollopet.adotei.backend.domain.entity.Animal;
import com.apollopet.adotei.backend.domain.entity.AnimalAdopterProfile;
import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.Organization;
import com.apollopet.adotei.backend.domain.entity.Role;
import com.apollopet.adotei.backend.domain.entity.UserCredential;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AdopterProfileRepository;
import com.apollopet.adotei.backend.domain.repository.AnimalAdopterProfileRepository;
import com.apollopet.adotei.backend.domain.repository.AnimalRepository;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import com.apollopet.adotei.backend.domain.repository.OrganizationRepository;
import com.apollopet.adotei.backend.domain.repository.RoleRepository;
import com.apollopet.adotei.backend.domain.repository.UserCredentialRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("local")
@ConditionalOnProperty(prefix = "app.seed.test-data", name = "enabled", havingValue = "true")
@EnableConfigurationProperties(TestDataSeedProperties.class)
@Order(1)
public class LocalTestDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalTestDataSeeder.class);

    private static final String[] ORG_NAMES = {
        "Instituto Patinhas Felizes",
        "Abrigo Amigo dos Animais",
        "ONG Vida Animal SP",
        "Projeto Cauda Abanando",
        "Refugio Esperanca Pet"
    };

    private static final String[] CITIES = {"Sao Paulo", "Campinas", "Santos", "Sorocaba", "Ribeirao Preto"};
    private static final String[] STATES = {"SP", "SP", "SP", "SP", "SP"};

    private static final String[] DOG_NAMES = {
        "Thor", "Luna", "Bob", "Mel", "Fred", "Nina", "Max", "Bela", "Duque", "Lili"
    };

    private static final String[] CAT_NAMES = {
        "Mia", "Simba", "Chico", "Lola", "Tom", "Mimi", "Felix", "Nala", "Ze", "Pipoca"
    };

    private record AnimalIdealProfile(
        List<String> suitableHousing,
        boolean requiresYard,
        boolean requiresWalledYard,
        boolean requiresWindowScreens,
        boolean allowsRented,
        boolean suitableForChildren,
        boolean suitableForFirstTimers,
        int maxHoursAloneDaily,
        String estimatedMonthlyCost,
        boolean requiresEmergencyBudget
    ) {}

    private static final List<AnimalIdealProfile> ANIMAL_IDEAL_PROFILES = List.of(
        new AnimalIdealProfile(List.of("house", "farm"), true, true, false, true, true, true, 6, "300-600", true),
        new AnimalIdealProfile(List.of("apartment"), false, false, true, true, true, false, 4, "300-600", true),
        new AnimalIdealProfile(List.of("house"), true, false, false, false, false, true, 8, "600+", true),
        new AnimalIdealProfile(List.of("house", "apartment"), false, false, true, true, true, true, 5, "100-300", false),
        new AnimalIdealProfile(List.of("farm", "house"), true, true, false, true, false, false, 4, "600+", true),
        new AnimalIdealProfile(List.of("apartment", "house"), false, false, true, false, true, true, 3, "300-600", true),
        new AnimalIdealProfile(List.of("house"), true, true, false, true, true, false, 6, "600+", true),
        new AnimalIdealProfile(List.of("apartment"), false, false, true, true, false, true, 4, "100-300", false),
        new AnimalIdealProfile(List.of("house", "farm"), true, false, false, true, true, true, 7, "300-600", true),
        new AnimalIdealProfile(List.of("house", "apartment"), false, false, false, true, true, false, 5, "300-600", true)
    );

    @PersistenceContext
    private EntityManager entityManager;

    private final TestDataSeedProperties properties;
    private final RoleRepository roleRepository;
    private final AppUserRepository appUserRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final AdopterProfileRepository adopterProfileRepository;
    private final OrganizationRepository organizationRepository;
    private final AnimalRepository animalRepository;
    private final AnimalAdopterProfileRepository animalAdopterProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public LocalTestDataSeeder(
        TestDataSeedProperties properties,
        RoleRepository roleRepository,
        AppUserRepository appUserRepository,
        UserCredentialRepository userCredentialRepository,
        AdopterProfileRepository adopterProfileRepository,
        OrganizationRepository organizationRepository,
        AnimalRepository animalRepository,
        AnimalAdopterProfileRepository animalAdopterProfileRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.properties = properties;
        this.roleRepository = roleRepository;
        this.appUserRepository = appUserRepository;
        this.userCredentialRepository = userCredentialRepository;
        this.adopterProfileRepository = adopterProfileRepository;
        this.organizationRepository = organizationRepository;
        this.animalRepository = animalRepository;
        this.animalAdopterProfileRepository = animalAdopterProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.warn("app.seed.test-data.enabled=true — limpando cadastros e recriando dados de teste...");

        clearTransactionalData();

        Role adopterRole = roleRepository.findByCode("ADOTANTE").orElseThrow();
        Role volunteerRole = roleRepository.findByCode("VOLUNTARIO").orElseThrow();

        String passwordHash = passwordEncoder.encode(properties.getDefaultPassword());

        for (int orgIndex = 0; orgIndex < ORG_NAMES.length; orgIndex++) {
            Organization organization = createOrganization(orgIndex);
            AppUser responsible = createVolunteer(
                volunteerRole,
                organization,
                orgIndex + 1,
                true,
                passwordHash
            );

            for (int animalIndex = 0; animalIndex < 10; animalIndex++) {
                createAnimal(organization, responsible, orgIndex, animalIndex);
            }
        }

        for (int i = 1; i <= 20; i++) {
            createAdopter(adopterRole, i, passwordHash);
        }

        log.info(
            "Seed concluido: 5 ONGs, 5 responsaveis (voluntarios), 50 animais com perfil ideal de adotante, 20 adotantes com perfil completo."
        );
        log.info("Senha padrao de todos os usuarios de teste: {}", properties.getDefaultPassword());
        log.info("Adotantes: adotante01@adotei.com ... adotante20@adotei.com");
        log.info("Responsaveis ONG: responsavel01@adotei.com ... responsavel05@adotei.com");
    }

    private void clearTransactionalData() {
        entityManager.createNativeQuery(
            """
            TRUNCATE TABLE
                animal_image,
                animal_vaccine,
                animal_temperament_trait,
                animal_requirement,
                animal_adopter_profile,
                animal,
                adopter_profile,
                user_credential,
                user_role,
                app_user,
                organization,
                tutor
            RESTART IDENTITY CASCADE
            """
        ).executeUpdate();
        entityManager.flush();
    }

    private Organization createOrganization(int index) {
        Organization organization = new Organization();
        organization.setLegalName(ORG_NAMES[index]);
        organization.setCnpj(String.format("%014d", 10000000000001L + index));
        organization.setPrimaryContactName("Contato " + ORG_NAMES[index]);
        organization.setContactPhone1("(11) 9" + String.format("%04d-%04d", 8000 + index, 1000 + index));
        organization.setCity(CITIES[index]);
        organization.setState(STATES[index]);
        organization.setTradeName(ORG_NAMES[index]);
        organization.setFoundedYear(2010 + index);
        organization.setMissionFocus("Adocao responsavel e cuidado animal");
        organization.setAboutText(
            "A " + ORG_NAMES[index] + " atua no resgate, reabilitacao e encaminhamento de animais "
                + "para lares definitivos na regiao de " + CITIES[index] + "."
        );
        organization.setStoryText(
            "Nossa historia comecou com um grupo de voluntarios mobilizados para acolher animais "
                + "em situacao de vulnerabilidade. Hoje mantemos uma rede de apoio com familias "
                + "cadastradas, feiras de adocao e acompanhamento pos-adocao."
        );
        organization.setStructureInfo(
            "Equipe de voluntarios, parceiros veterinarios e lares temporarios na regiao metropolitana."
        );
        organization.setContactEmail(String.format("contato%02d@adotei.com", index + 1));
        organization.setPublished(true);
        return organizationRepository.save(organization);
    }

    private AppUser createVolunteer(
        Role volunteerRole,
        Organization organization,
        int number,
        boolean responsible,
        String passwordHash
    ) {
        String email = String.format("responsavel%02d@adotei.com", number);
        AppUser user = new AppUser();
        user.setAuthSubject(email);
        user.setEmail(email);
        user.setFullName("Responsavel ONG " + number);
        user.setPhone("(11) 98765-" + String.format("%04d", 1000 + number));
        user.setUserType(UserType.VOLUNTARIO);
        user.setOrganization(organization);
        user.setOrganizationResponsible(responsible);
        user.setCity(organization.getCity());
        user.setState(organization.getState());
        user.setRoles(new HashSet<>(Set.of(volunteerRole)));

        AppUser saved = appUserRepository.save(user);
        saveCredential(saved, passwordHash);
        return saved;
    }

    private void createAdopter(Role adopterRole, int number, String passwordHash) {
        String email = String.format("adotante%02d@adotei.com", number);
        AppUser user = new AppUser();
        user.setAuthSubject(email);
        user.setEmail(email);
        user.setFullName("Adotante Teste " + number);
        user.setPhone("(11) 91234-" + String.format("%04d", 5000 + number));
        user.setUserType(UserType.ADOTANTE);
        user.setCity(CITIES[number % CITIES.length]);
        user.setState("SP");
        user.setAddressLine("Rua Teste");
        user.setAddressNumber(String.valueOf(100 + number));
        user.setNeighborhood("Centro");
        user.setZipCode("01001000");
        user.setRoles(new HashSet<>(Set.of(adopterRole)));

        AppUser saved = appUserRepository.save(user);
        saveCredential(saved, passwordHash);
        saveAdopterProfile(saved, number);
    }

    private void saveAdopterProfile(AppUser user, int variant) {
        AdopterProfile profile = new AdopterProfile();
        profile.setUser(user);

        boolean hasYard = variant % 3 != 0;
        boolean rented = variant % 4 == 0;
        boolean hasChildren = variant % 5 == 0;
        boolean hadPets = variant % 2 == 0;

        profile.setHousingType(variant % 2 == 0 ? "house" : "apartment");
        profile.setOwnershipType(rented ? "rented" : "owned");
        profile.setRentAllowsPets(rented ? variant % 2 == 0 : null);
        profile.setHasYard(hasYard);
        profile.setYardWalled(hasYard && variant % 2 == 0);
        profile.setHasWindowScreens(variant % 2 == 1);
        profile.setResidentsCount(2 + (variant % 3));
        profile.setHasChildren(hasChildren);
        profile.setChildrenAges(hasChildren ? "6, 10" : null);
        profile.setHadPetsBefore(hadPets);
        profile.setCurrentlyHasPets(variant % 7 == 0);
        profile.setReturnedAnimal(false);
        profile.setAwareOfCosts(true);
        profile.setMonthlyBudget(switch (variant % 3) {
            case 0 -> "100-300";
            case 1 -> "300-600";
            default -> "600+";
        });
        profile.setWillCoverVaccines(true);
        profile.setWillCoverNeutering(true);
        profile.setWillCoverEmergencies(variant % 4 != 0);
        profile.setReasonToAdopt(
            "Quero adotar para oferecer um lar amoroso e seguro. Variante de teste "
                + variant
                + ". Tenho estrutura e tempo para cuidar bem do pet."
        );
        profile.setHoursAloneDaily(2 + (variant % 7));
        profile.setIfDestroyed("Buscaria treinamento e paciencia, sem abandonar o animal.");
        profile.setIfSick("Levaria ao veterinario imediatamente e seguiria o tratamento.");
        profile.setWillAdapt(true);

        adopterProfileRepository.save(profile);
    }

    private void createAnimal(Organization organization, AppUser createdBy, int orgIndex, int animalIndex) {
        boolean isDog = (orgIndex + animalIndex) % 2 == 0;
        String name = isDog
            ? DOG_NAMES[animalIndex]
            : CAT_NAMES[animalIndex];

        Animal animal = new Animal();
        animal.setName(name + " O" + (orgIndex + 1));
        animal.setAnimalType(isDog ? "cachorro" : "gato");
        animal.setBreed("Sem raca definida");
        animal.setAgeYears(1 + (animalIndex % 8));
        animal.setSex(animalIndex % 2 == 0 ? "macho" : "femea");
        animal.setSize(switch (animalIndex % 3) {
            case 0 -> "pequeno";
            case 1 -> "medio";
            default -> "grande";
        });
        animal.setDescription(
            "Animal de teste cadastrado pela "
                + organization.getLegalName()
                + ". Perfil "
                + (animalIndex + 1)
                + " para validar compatibilidade."
        );
        animal.setSterilized(animalIndex % 3 != 0);
        animal.setVaccinationStatus(animalIndex % 2 == 0 ? "complete" : "partial");
        animal.setGoodWithChildren(animalIndex % 4 != 0);
        animal.setGoodWithOtherAnimals(animalIndex % 5 != 0);
        animal.setGoodWithSeniors(true);
        animal.setLocation(organization.getCity() + " - " + organization.getState());
        animal.setPersonalityTemperament(
            switch (animalIndex % 4) {
                case 0 -> "Dócil";
                case 1 -> "Brincalhao";
                case 2 -> "Calmo";
                default -> "Protetor";
            }
        );
        animal.setOrganization(organization);
        animal.setCreatedBy(createdBy);

        Animal saved = animalRepository.save(animal);
        saveAnimalIdealProfile(saved, animalIndex);
    }

    private void saveAnimalIdealProfile(Animal animal, int templateIndex) {
        AnimalIdealProfile template = ANIMAL_IDEAL_PROFILES.get(templateIndex % ANIMAL_IDEAL_PROFILES.size());

        AnimalAdopterProfile profile = new AnimalAdopterProfile();
        profile.setAnimal(animal);
        profile.setSuitableHousing(String.join(",", template.suitableHousing()));
        profile.setRequiresYard(template.requiresYard());
        profile.setRequiresWalledYard(template.requiresWalledYard());
        profile.setRequiresWindowScreens(template.requiresWindowScreens());
        profile.setAllowsRented(template.allowsRented());
        profile.setSuitableForChildren(template.suitableForChildren());
        profile.setSuitableForFirstTimers(template.suitableForFirstTimers());
        profile.setMaxHoursAloneDaily(template.maxHoursAloneDaily());
        profile.setEstimatedMonthlyCost(template.estimatedMonthlyCost());
        profile.setRequiresEmergencyBudget(template.requiresEmergencyBudget());

        animalAdopterProfileRepository.save(profile);
    }

    private void saveCredential(AppUser user, String passwordHash) {
        UserCredential credential = new UserCredential();
        credential.setUser(user);
        credential.setPasswordHash(passwordHash);
        userCredentialRepository.save(credential);
    }
}
