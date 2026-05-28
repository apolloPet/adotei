package com.apollopet.adotei.backend.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.apollopet.adotei.backend.application.exception.BadRequestException;
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
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private AppUserRepository appUserRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private AdopterProfileRepository adopterProfileRepository;
    @Mock private OrganizationRepository organizationRepository;
    @Mock private UserCredentialRepository userCredentialRepository;
    @Mock private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(
            appUserRepository,
            roleRepository,
            adopterProfileRepository,
            organizationRepository,
            userCredentialRepository,
            passwordEncoder
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
    void deveCriarAdotanteComPapelAdotante() {
        mockSaveAndReload();

        Role role = new Role();
        role.setCode("ADOTANTE");
        when(roleRepository.findByCode("ADOTANTE")).thenReturn(Optional.of(role));

        var response = userService.create(request("ADOTANTE", List.of("ADOTANTE")));

        assertEquals("ADOTANTE", response.userType());
        assertEquals(List.of("ADOTANTE"), response.roles());
    }

    @Test
    void deveFalharQuandoTipoNaoCombinaComPapel() {
        Role role = new Role();
        role.setCode("VOLUNTARIO");
        when(roleRepository.findByCode("VOLUNTARIO")).thenReturn(Optional.of(role));

        assertThrows(BadRequestException.class, () -> userService.create(request("ADOTANTE", List.of("VOLUNTARIO"))));
    }

    @Test
    void deveFalharQuandoUsuarioTemMaisDeUmPapel() {
        Role admin = new Role();
        admin.setCode("ADMIN");
        Role voluntario = new Role();
        voluntario.setCode("VOLUNTARIO");
        when(roleRepository.findByCode("ADMIN")).thenReturn(Optional.of(admin));
        when(roleRepository.findByCode("VOLUNTARIO")).thenReturn(Optional.of(voluntario));

        assertThrows(
            BadRequestException.class,
            () -> userService.create(request("ADMIN", List.of("ADMIN", "VOLUNTARIO")))
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
        Role role = new Role();
        role.setCode("VOLUNTARIO");
        when(roleRepository.findByCode("VOLUNTARIO")).thenReturn(Optional.of(role));

        assertThrows(BadRequestException.class, () -> userService.create(request("VOLUNTARIO", List.of("VOLUNTARIO"), null)));
    }

    @Test
    void deveCriarVoluntarioComOng() {
        mockSaveAndReload();
        Role role = new Role();
        role.setCode("VOLUNTARIO");
        when(roleRepository.findByCode("VOLUNTARIO")).thenReturn(Optional.of(role));
        UUID organizationId = UUID.randomUUID();
        Organization organization = new Organization();
        when(organizationRepository.findById(organizationId)).thenReturn(Optional.of(organization));
        when(passwordEncoder.encode("senha123")).thenReturn("encoded-hash");

        var response = userService.create(
            request("VOLUNTARIO", List.of("VOLUNTARIO"), organizationId, "senha123")
        );

        assertEquals("VOLUNTARIO", response.userType());
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

    private UpsertUserRequest request(String userType, List<String> roles) {
        return request(userType, roles, null);
    }

    private UpsertUserRequest request(String userType, List<String> roles, UUID organizationId) {
        return request(userType, roles, organizationId, null);
    }

    private UpsertUserRequest request(String userType, List<String> roles, UUID organizationId, String password) {
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
            roles
        );
    }
}
