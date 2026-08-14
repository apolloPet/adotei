package com.apollopet.adotei.backend.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.apollopet.adotei.backend.application.exception.BadRequestException;
import com.apollopet.adotei.backend.domain.entity.AdminPermission;
import com.apollopet.adotei.backend.domain.entity.AdopterProfile;
import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.Organization;
import com.apollopet.adotei.backend.domain.entity.Role;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AdopterProfileRepository;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import com.apollopet.adotei.backend.domain.repository.OrganizationRepository;
import com.apollopet.adotei.backend.domain.repository.RoleRepository;
import com.apollopet.adotei.backend.domain.repository.UserCredentialRepository;
import com.apollopet.adotei.backend.web.dto.UserDtos.AdminPermissionsDto;
import com.apollopet.adotei.backend.web.dto.UserDtos.UpsertAdopterProfileRequest;
import com.apollopet.adotei.backend.web.dto.UserDtos.UpsertUserRequest;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    private static final String REQUESTER = "requester-auth";

    @Mock private AppUserRepository appUserRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private AdopterProfileRepository adopterProfileRepository;
    @Mock private OrganizationRepository organizationRepository;
    @Mock private UserCredentialRepository userCredentialRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AdminPermissionGuard adminPermissionGuard;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(
            appUserRepository,
            roleRepository,
            adopterProfileRepository,
            organizationRepository,
            userCredentialRepository,
            passwordEncoder,
            adminPermissionGuard
        );
    }

    private void mockSaveAndReload() {
        AtomicReference<AppUser> persistedUser = new AtomicReference<>();
        when(appUserRepository.save(any(AppUser.class))).thenAnswer(invocation -> {
            AppUser saved = invocation.getArgument(0);
            persistedUser.set(saved);
            return saved;
        });
        when(appUserRepository.findById(nullable(UUID.class)))
            .thenAnswer(invocation -> Optional.ofNullable(persistedUser.get()));
    }

    @Test
    void deveIncluirPerfilCompletoDoAdotanteNaListaDoAdministrador() {
        AppUser admin = new AppUser();
        admin.setUserType(UserType.ADMIN);
        admin.setRoles(Set.of());
        admin.prePersist();

        AppUser adopter = new AppUser();
        adopter.setUserType(UserType.ADOTANTE);
        adopter.setRoles(Set.of());
        adopter.prePersist();

        AdopterProfile profile = new AdopterProfile();
        profile.setUser(adopter);
        profile.setHousingType("house");
        profile.setHasYard(true);
        profile.setMonthlyBudget("300-600");
        profile.prePersist();

        when(appUserRepository.findByAuthSubject(REQUESTER)).thenReturn(Optional.of(admin));
        when(appUserRepository.findAll()).thenReturn(List.of(adopter));
        when(adopterProfileRepository.findAllByUser_UserType(UserType.ADOTANTE)).thenReturn(List.of(profile));

        var response = userService.list(REQUESTER);

        assertEquals(1, response.size());
        assertNotNull(response.getFirst().adopterProfile());
        assertEquals("house", response.getFirst().adopterProfile().housingType());
        assertEquals(true, response.getFirst().adopterProfile().hasYard());
        assertEquals("300-600", response.getFirst().adopterProfile().monthlyBudget());
    }

    @Test
    void deveCriarAdotanteComPapelAdotante() {
        mockSaveAndReload();

        Role role = new Role();
        role.setCode("ADOTANTE");
        when(roleRepository.findByCode("ADOTANTE")).thenReturn(Optional.of(role));

        when(adminPermissionGuard.require(eq(REQUESTER), eq(AdminPermission.MANAGE_USERS)))
            .thenReturn(adminRequester());

        var response = userService.create(request("ADOTANTE", List.of("ADOTANTE")), REQUESTER);

        assertEquals("ADOTANTE", response.userType());
        assertEquals(List.of("ADOTANTE"), response.roles());
        verify(adminPermissionGuard).require(REQUESTER, AdminPermission.MANAGE_USERS);
    }

    @Test
    void deveFalharQuandoTipoNaoCombinaComPapel() {
        when(adminPermissionGuard.require(eq(REQUESTER), eq(AdminPermission.MANAGE_USERS)))
            .thenReturn(adminRequester());
        Role role = new Role();
        role.setCode("VOLUNTARIO");
        when(roleRepository.findByCode("VOLUNTARIO")).thenReturn(Optional.of(role));

        assertThrows(
            BadRequestException.class,
            () -> userService.create(request("ADOTANTE", List.of("VOLUNTARIO")), REQUESTER)
        );
    }

    @Test
    void deveFalharQuandoUsuarioTemMaisDeUmPapel() {
        doNothing().when(adminPermissionGuard)
            .requireAdminPermission(eq(REQUESTER), eq(AdminPermission.MANAGE_ADMINS));
        Role admin = new Role();
        admin.setCode("ADMIN");
        Role voluntario = new Role();
        voluntario.setCode("VOLUNTARIO");
        when(roleRepository.findByCode("ADMIN")).thenReturn(Optional.of(admin));
        when(roleRepository.findByCode("VOLUNTARIO")).thenReturn(Optional.of(voluntario));

        assertThrows(
            BadRequestException.class,
            () -> userService.create(request("ADMIN", List.of("ADMIN", "VOLUNTARIO")), REQUESTER)
        );
    }

    @Test
    void deveImpedirPerfilDeAdotanteParaUsuarioNaoAdotante() {
        UUID userId = UUID.randomUUID();
        AppUser user = new AppUser();
        user.setUserType(UserType.VOLUNTARIO);
        user.setRoles(Set.of());
        AppUser adminRequester = new AppUser();
        adminRequester.setUserType(UserType.ADMIN);
        adminRequester.setRoles(Set.of());
        when(appUserRepository.findById(userId)).thenReturn(Optional.of(user));
        when(appUserRepository.findByAuthSubject("admin-auth")).thenReturn(Optional.of(adminRequester));

        UpsertAdopterProfileRequest request = new UpsertAdopterProfileRequest(
            null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null
        );

        assertThrows(BadRequestException.class, () -> userService.upsertAdopterProfile(userId, request, "admin-auth"));
        verifyNoInteractions(adopterProfileRepository);
    }

    @Test
    void deveFalharQuandoVoluntarioNaoTemOng() {
        when(adminPermissionGuard.require(eq(REQUESTER), eq(AdminPermission.MANAGE_USERS)))
            .thenReturn(new AppUser());
        Role role = new Role();
        role.setCode("VOLUNTARIO");
        when(roleRepository.findByCode("VOLUNTARIO")).thenReturn(Optional.of(role));

        assertThrows(
            BadRequestException.class,
            () -> userService.create(request("VOLUNTARIO", List.of("VOLUNTARIO"), null), REQUESTER)
        );
    }

    @Test
    void deveCriarVoluntarioComOng() {
        mockSaveAndReload();
        when(adminPermissionGuard.require(eq(REQUESTER), eq(AdminPermission.MANAGE_USERS)))
            .thenReturn(new AppUser());
        Role role = new Role();
        role.setCode("VOLUNTARIO");
        when(roleRepository.findByCode("VOLUNTARIO")).thenReturn(Optional.of(role));
        UUID organizationId = UUID.randomUUID();
        Organization organization = new Organization();
        when(organizationRepository.findById(organizationId)).thenReturn(Optional.of(organization));
        when(passwordEncoder.encode("senha123")).thenReturn("encoded-hash");
        when(userCredentialRepository.findByUserId(nullable(UUID.class))).thenReturn(Optional.empty());

        var response = userService.create(
            request("VOLUNTARIO", List.of("VOLUNTARIO"), organizationId, "senha123"),
            REQUESTER
        );

        assertEquals("VOLUNTARIO", response.userType());
        verify(userCredentialRepository).save(any());
    }

    @Test
    void deveCriarAdminComSenhaEPermissoes() {
        mockSaveAndReload();
        doNothing().when(adminPermissionGuard)
            .requireAdminPermission(eq(REQUESTER), eq(AdminPermission.MANAGE_ADMINS));
        Role role = new Role();
        role.setCode("ADMIN");
        when(roleRepository.findByCode("ADMIN")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("senhaAdmin")).thenReturn("encoded-admin-hash");
        when(userCredentialRepository.findByUserId(nullable(UUID.class))).thenReturn(Optional.empty());

        var response = userService.create(
            request(
                "ADMIN",
                List.of("ADMIN"),
                null,
                "senhaAdmin",
                new AdminPermissionsDto(true, false, true, false, true)
            ),
            REQUESTER
        );

        assertEquals("ADMIN", response.userType());
        assertEquals(List.of("ADMIN"), response.roles());
        assertNotNull(response.permissions());
        assertEquals(true, response.permissions().manageAnimals());
        assertEquals(false, response.permissions().approveAdoptions());
        assertEquals(true, response.permissions().manageSettings());
        assertEquals(false, response.permissions().manageAdmins());
        verify(passwordEncoder).encode("senhaAdmin");
        verify(userCredentialRepository).save(any());
    }

    @Test
    void deveFalharAoCriarAdminSemSenha() {
        doNothing().when(adminPermissionGuard)
            .requireAdminPermission(eq(REQUESTER), eq(AdminPermission.MANAGE_ADMINS));
        Role role = new Role();
        role.setCode("ADMIN");
        when(roleRepository.findByCode("ADMIN")).thenReturn(Optional.of(role));
        when(appUserRepository.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThrows(
            BadRequestException.class,
            () -> userService.create(request("ADMIN", List.of("ADMIN"), null, null), REQUESTER)
        );
        verifyNoInteractions(userCredentialRepository);
    }

    @Test
    void devePermitirAdotanteSalvarProprioPerfilDeAdotante() {
        AppUser adopter = new AppUser();
        adopter.setUserType(UserType.ADOTANTE);

        when(appUserRepository.findByAuthSubject("adotante-auth")).thenReturn(Optional.of(adopter));
        when(adopterProfileRepository.findByUserId(nullable(UUID.class))).thenReturn(Optional.empty());

        UpsertAdopterProfileRequest request = new UpsertAdopterProfileRequest(
            "house", "owned", false, false, false, false, 1, false, null, false,
            false, null, null, false, null, null, false, null, false, false,
            false, null, null, null, null, true, null, null
        );

        userService.upsertOwnAdopterProfile("adotante-auth", request);

        verify(adopterProfileRepository).save(any(AdopterProfile.class));
    }

    @Test
    void deveImpedirSalvarPerfilDeAdotanteParaUsuarioNaoAdotanteNoFluxoProprio() {
        AppUser volunteer = new AppUser();
        volunteer.setUserType(UserType.VOLUNTARIO);

        when(appUserRepository.findByAuthSubject("voluntario-auth")).thenReturn(Optional.of(volunteer));

        UpsertAdopterProfileRequest request = new UpsertAdopterProfileRequest(
            null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null
        );

        assertThrows(BadRequestException.class, () -> userService.upsertOwnAdopterProfile("voluntario-auth", request));
        verifyNoInteractions(adopterProfileRepository);
    }

    @Test
    void deveImpedirVoluntarioDeGerenciarUsuarioDeOutraOng() {
        UUID ownOrganizationId = UUID.randomUUID();
        Organization ownOrganization = new Organization();
        ownOrganization.prePersist();
        AppUser volunteerRequester = new AppUser();
        volunteerRequester.setUserType(UserType.VOLUNTARIO);
        volunteerRequester.setOrganization(ownOrganization);

        when(adminPermissionGuard.require(eq(REQUESTER), eq(AdminPermission.MANAGE_USERS)))
            .thenReturn(volunteerRequester);

        assertThrows(
            AccessDeniedException.class,
            () -> userService.create(request("VOLUNTARIO", List.of("VOLUNTARIO"), ownOrganizationId, "senha123"), REQUESTER)
        );
        verifyNoInteractions(appUserRepository);
    }

    @Test
    void devePersistirPermissoesDoVoluntario() {
        mockSaveAndReload();
        when(adminPermissionGuard.require(eq(REQUESTER), eq(AdminPermission.MANAGE_USERS)))
            .thenReturn(adminRequester());
        Role role = new Role();
        role.setCode("VOLUNTARIO");
        when(roleRepository.findByCode("VOLUNTARIO")).thenReturn(Optional.of(role));
        UUID organizationId = UUID.randomUUID();
        when(organizationRepository.findById(organizationId)).thenReturn(Optional.of(new Organization()));
        when(passwordEncoder.encode("senha123")).thenReturn("encoded-hash");
        when(userCredentialRepository.findByUserId(nullable(UUID.class))).thenReturn(Optional.empty());

        var response = userService.create(
            request(
                "VOLUNTARIO",
                List.of("VOLUNTARIO"),
                organizationId,
                "senha123",
                new AdminPermissionsDto(true, false, true, true, true)
            ),
            REQUESTER
        );

        assertNotNull(response.permissions());
        assertEquals(true, response.permissions().manageAnimals());
        assertEquals(false, response.permissions().approveAdoptions());
        assertEquals(true, response.permissions().manageUsers());
        // voluntario nunca recebe permissoes exclusivas de administrador
        assertEquals(false, response.permissions().manageSettings());
        assertEquals(false, response.permissions().manageAdmins());
    }

    private AppUser adminRequester() {
        AppUser admin = new AppUser();
        admin.setUserType(UserType.ADMIN);
        return admin;
    }

    private UpsertUserRequest request(String userType, List<String> roles) {
        return request(userType, roles, null);
    }

    private UpsertUserRequest request(String userType, List<String> roles, UUID organizationId) {
        return request(userType, roles, organizationId, null);
    }

    private UpsertUserRequest request(String userType, List<String> roles, UUID organizationId, String password) {
        return request(userType, roles, organizationId, password, null);
    }

    private UpsertUserRequest request(
        String userType,
        List<String> roles,
        UUID organizationId,
        String password,
        AdminPermissionsDto permissions
    ) {
        return new UpsertUserRequest(
            "auth-subject",
            "Pessoa Teste",
            "pessoa@teste.com",
            "11999999999",
            userType,
            null,
            null,
            null,
            null,
            null,
            null,
            organizationId,
            false,
            password,
            permissions,
            roles
        );
    }
}
