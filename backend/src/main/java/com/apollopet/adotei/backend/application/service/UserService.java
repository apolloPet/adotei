package com.apollopet.adotei.backend.application.service;

import com.apollopet.adotei.backend.application.exception.BadRequestException;
import com.apollopet.adotei.backend.application.exception.NotFoundException;
import com.apollopet.adotei.backend.domain.entity.AdminPermission;
import com.apollopet.adotei.backend.domain.entity.AdminPermissions;
import com.apollopet.adotei.backend.domain.entity.AdopterProfile;
import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.Organization;
import com.apollopet.adotei.backend.domain.entity.Role;
import com.apollopet.adotei.backend.domain.entity.UserCredential;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AdopterProfileRepository;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import com.apollopet.adotei.backend.domain.repository.OrganizationRepository;
import com.apollopet.adotei.backend.domain.repository.RoleRepository;
import com.apollopet.adotei.backend.domain.repository.UserCredentialRepository;
import com.apollopet.adotei.backend.web.dto.UserDtos.AdopterProfileResponse;
import com.apollopet.adotei.backend.web.dto.UserDtos.AdminPermissionsDto;
import com.apollopet.adotei.backend.web.dto.UserDtos.UpsertAdopterProfileRequest;
import com.apollopet.adotei.backend.web.dto.UserDtos.UpdateOwnProfileRequest;
import com.apollopet.adotei.backend.web.dto.UserDtos.UpsertUserRequest;
import com.apollopet.adotei.backend.web.dto.UserDtos.UserResponse;
import com.apollopet.adotei.backend.web.dto.UserDtos.UserTypeResponse;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final AdopterProfileRepository adopterProfileRepository;
    private final OrganizationRepository organizationRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminPermissionGuard adminPermissionGuard;

    public UserService(
        AppUserRepository appUserRepository,
        RoleRepository roleRepository,
        AdopterProfileRepository adopterProfileRepository,
        OrganizationRepository organizationRepository,
        UserCredentialRepository userCredentialRepository,
        PasswordEncoder passwordEncoder,
        AdminPermissionGuard adminPermissionGuard
    ) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.adopterProfileRepository = adopterProfileRepository;
        this.organizationRepository = organizationRepository;
        this.userCredentialRepository = userCredentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminPermissionGuard = adminPermissionGuard;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> list(String requesterAuthSubject) {
        AppUser requester = loadRequester(requesterAuthSubject);
        if (requester.getUserType() == UserType.ADMIN) {
            Map<UUID, AdopterProfileResponse> profilesByUserId = adopterProfileRepository
                .findAllByUser_UserType(UserType.ADOTANTE)
                .stream()
                .map(this::toAdopterProfileResponse)
                .collect(Collectors.toMap(AdopterProfileResponse::userId, Function.identity()));

            return appUserRepository.findAll().stream()
                .map(user -> toResponse(user, profilesByUserId.get(user.getId())))
                .toList();
        }
        if (requester.getUserType() == UserType.VOLUNTARIO && requester.getOrganization() != null) {
            return appUserRepository.findByOrganizationId(requester.getOrganization().getId()).stream()
                .map(this::toResponse)
                .toList();
        }
        throw new AccessDeniedException("Sem permissao para listar usuarios.");
    }

    @Transactional(readOnly = true)
    public UserResponse get(UUID id, String requesterAuthSubject) {
        AppUser requester = loadRequester(requesterAuthSubject);
        AppUser requested = loadUser(id);
        if (requester.getUserType() == UserType.ADMIN) {
            AdopterProfileResponse profile = adopterProfileRepository.findByUserId(id)
                .map(this::toAdopterProfileResponse)
                .orElse(null);
            return toResponse(requested, profile);
        }
        if (
            requester.getUserType() == UserType.VOLUNTARIO &&
            requester.getOrganization() != null &&
            requested.getOrganization() != null &&
            requester.getOrganization().getId().equals(requested.getOrganization().getId())
        ) {
            return toResponse(requested);
        }
        throw new AccessDeniedException("Sem permissao para consultar este usuario.");
    }

    @Transactional(readOnly = true)
    public UserResponse getByAuthSubject(String authSubject) {
        AppUser user = appUserRepository.findByAuthSubject(authSubject)
            .orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public AdopterProfileResponse getAdopterProfile(UUID userId, String requesterAuthSubject) {
        AppUser requester = appUserRepository.findByAuthSubject(requesterAuthSubject)
            .orElseThrow(() -> new NotFoundException("Usuario autenticado nao encontrado"));
        AppUser requestedUser = loadUser(userId);

        if (
            requester.getUserType() == UserType.ADOTANTE &&
            !requester.getId().equals(requestedUser.getId())
        ) {
            throw new AccessDeniedException("Adotante pode consultar apenas seu proprio perfil.");
        }
        if (requester.getUserType() == UserType.VOLUNTARIO) {
            throw new AccessDeniedException("Voluntario nao pode consultar perfil completo de adotante.");
        }

        AdopterProfile profile = adopterProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new NotFoundException("Perfil de adotante nao encontrado"));
        return toAdopterProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public AdopterProfileResponse getAdopterProfileByAuthSubject(String requesterAuthSubject) {
        AppUser requester = appUserRepository.findByAuthSubject(requesterAuthSubject)
            .orElseThrow(() -> new NotFoundException("Usuario autenticado nao encontrado"));
        AdopterProfile profile = adopterProfileRepository.findByUserId(requester.getId())
            .orElseThrow(() -> new NotFoundException("Perfil de adotante nao encontrado"));
        return toAdopterProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listVolunteersByOrganization(UUID organizationId, String requesterAuthSubject) {
        AppUser requester = loadRequester(requesterAuthSubject);
        organizationRepository.findById(organizationId)
            .orElseThrow(() -> new NotFoundException("Organizacao nao encontrada"));
        if (requester.getUserType() == UserType.VOLUNTARIO) {
            if (
                requester.getOrganization() == null ||
                !requester.getOrganization().getId().equals(organizationId)
            ) {
                throw new AccessDeniedException("Voluntario so pode listar voluntarios da propria ONG.");
            }
        }

        return appUserRepository.findByOrganizationIdAndUserType(organizationId, UserType.VOLUNTARIO).stream()
            .map(this::toResponse)
            .toList();
    }

    public List<UserTypeResponse> listUserTypes() {
        return Arrays.stream(UserType.values())
            .map(type -> new UserTypeResponse(type.name(), type.description()))
            .toList();
    }

    @Transactional
    public UserResponse create(UpsertUserRequest request, String requesterAuthSubject) {
        UserType userType = parseUserType(request.userType());
        assertCanManageTarget(requesterAuthSubject, userType, request.organizationId());

        AppUser user = new AppUser();
        apply(user, request);
        AppUser saved = appUserRepository.save(user);
        upsertCredential(saved, request, true);
        return toResponse(loadUser(saved.getId()));
    }

    @Transactional
    public UserResponse update(UUID id, UpsertUserRequest request, String requesterAuthSubject) {
        AppUser user = loadUser(id);
        UserType requestedType = parseUserType(request.userType());
        Organization currentOrganization = user.getOrganization();
        assertCanManageTarget(
            requesterAuthSubject,
            user.getUserType(),
            currentOrganization != null ? currentOrganization.getId() : null
        );
        assertCanManageTarget(requesterAuthSubject, requestedType, request.organizationId());

        apply(user, request);
        AppUser saved = appUserRepository.save(user);
        upsertCredential(saved, request, false);
        return toResponse(loadUser(id));
    }

    @Transactional
    public void delete(UUID id, String requesterAuthSubject) {
        AppUser user = loadUser(id);
        AppUser requester = loadRequester(requesterAuthSubject);
        if (requester.getId() != null && requester.getId().equals(user.getId())) {
            throw new BadRequestException("Nao e permitido excluir a propria conta.");
        }
        Organization organization = user.getOrganization();
        assertCanManageTarget(
            requesterAuthSubject,
            user.getUserType(),
            organization != null ? organization.getId() : null
        );
        appUserRepository.delete(user);
    }

    @Transactional
    public UserResponse updateOwnProfile(String authSubject, UpdateOwnProfileRequest request) {
        AppUser user = appUserRepository.findByAuthSubject(authSubject)
            .orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));

        user.setFullName(request.fullName());
        user.setPhone(request.phone());
        user.setAddressLine(request.addressLine());
        user.setAddressNumber(request.addressNumber());
        user.setNeighborhood(request.neighborhood());
        user.setCity(request.city());
        user.setState(request.state());
        user.setZipCode(request.zipCode());

        appUserRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public void upsertAdopterProfile(UUID userId, UpsertAdopterProfileRequest request, String requesterAuthSubject) {
        AppUser requester = loadRequester(requesterAuthSubject);
        if (requester.getUserType() != UserType.ADMIN) {
            throw new AccessDeniedException("Somente administradores podem alterar perfil de adotante de terceiros.");
        }
        AppUser user = loadUser(userId);
        upsertAdopterProfileForUser(user, request);
    }

    @Transactional
    public void upsertOwnAdopterProfile(String authSubject, UpsertAdopterProfileRequest request) {
        AppUser user = appUserRepository.findByAuthSubject(authSubject)
            .orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));
        upsertAdopterProfileForUser(user, request);
    }

    private void upsertAdopterProfileForUser(AppUser user, UpsertAdopterProfileRequest request) {
        if (user.getUserType() != UserType.ADOTANTE) {
            throw new BadRequestException("Perfil de adotante so pode ser preenchido por usuarios do tipo ADOTANTE.");
        }
        AdopterProfile profile = adopterProfileRepository.findByUserId(user.getId()).orElseGet(AdopterProfile::new);
        profile.setUser(user);
        profile.setHousingType(request.housingType());
        profile.setOwnershipType(request.ownershipType());
        profile.setRentAllowsPets(request.rentAllowsPets());
        profile.setHasYard(request.hasYard());
        profile.setYardWalled(request.yardWalled());
        profile.setHasWindowScreens(request.hasWindowScreens());
        profile.setResidentsCount(request.residentsCount());
        profile.setHasChildren(request.hasChildren());
        profile.setChildrenAges(request.childrenAges());
        profile.setHadPetsBefore(request.hadPetsBefore());
        profile.setCurrentlyHasPets(request.currentlyHasPets());
        profile.setCurrentPetsCount(request.currentPetsCount());
        profile.setCurrentPetsTypes(request.currentPetsTypes());
        profile.setReturnedAnimal(request.returnedAnimal());
        profile.setPetsVaccinated(request.petsVaccinated());
        profile.setPetsNeutered(request.petsNeutered());
        profile.setAwareOfCosts(request.awareOfCosts());
        profile.setMonthlyBudget(request.monthlyBudget());
        profile.setWillCoverVaccines(request.willCoverVaccines());
        profile.setWillCoverNeutering(request.willCoverNeutering());
        profile.setWillCoverEmergencies(request.willCoverEmergencies());
        profile.setReasonToAdopt(request.reasonToAdopt());
        profile.setHoursAloneDaily(request.hoursAloneDaily());
        profile.setIfDestroyed(request.ifDestroyed());
        profile.setIfSick(request.ifSick());
        profile.setWillAdapt(request.willAdapt());
        profile.setEnvironmentPhotoUrl(request.environmentPhotoUrl());
        profile.setEnvironmentVideoUrl(request.environmentVideoUrl());
        adopterProfileRepository.save(profile);
    }

    /**
     * Administradores usam MANAGE_ADMINS para contas admin e MANAGE_USERS para as demais.
     * Voluntarios com MANAGE_USERS gerenciam apenas voluntarios da propria ONG.
     */
    private void assertCanManageTarget(String requesterAuthSubject, UserType targetType, UUID targetOrganizationId) {
        if (targetType == UserType.ADMIN) {
            adminPermissionGuard.requireAdminPermission(requesterAuthSubject, AdminPermission.MANAGE_ADMINS);
            return;
        }

        AppUser requester = adminPermissionGuard.require(requesterAuthSubject, AdminPermission.MANAGE_USERS);
        if (requester.getUserType() != UserType.VOLUNTARIO) {
            return;
        }

        Organization requesterOrganization = requester.getOrganization();
        if (
            targetType != UserType.VOLUNTARIO ||
            requesterOrganization == null ||
            targetOrganizationId == null ||
            !requesterOrganization.getId().equals(targetOrganizationId)
        ) {
            throw new AccessDeniedException("Voluntario so pode gerenciar voluntarios da propria ONG.");
        }
    }

    private AppUser loadRequester(String authSubject) {
        return appUserRepository.findByAuthSubject(authSubject)
            .orElseThrow(() -> new NotFoundException("Usuario autenticado nao encontrado"));
    }

    private AppUser loadUser(UUID id) {
        return appUserRepository.findById(id).orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));
    }

    private void apply(AppUser user, UpsertUserRequest request) {
        UserType userType = parseUserType(request.userType());
        user.setAuthSubject(request.authSubject());
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setUserType(userType);
        user.setAddressLine(request.addressLine());
        user.setAddressNumber(request.addressNumber());
        user.setNeighborhood(request.neighborhood());
        user.setCity(request.city());
        user.setState(request.state());
        user.setZipCode(request.zipCode());
        user.setOrganization(resolveOrganization(request.organizationId()));
        boolean isVolunteerResponsible = userType == UserType.VOLUNTARIO && Boolean.TRUE.equals(request.organizationResponsible());
        user.setOrganizationResponsible(isVolunteerResponsible);

        Set<Role> roles = request.roles().stream()
            .map(code -> roleRepository.findByCode(code)
                .orElseThrow(() -> new NotFoundException("Role nao encontrada: " + code)))
            .collect(Collectors.toSet());
        validateRolesByType(userType, roles);
        validateOrganizationByType(userType, user.getOrganization());
        user.setRoles(roles);
        user.setAdminPermissions(resolveAdminPermissions(user, userType, request.permissions()));
    }

    private AdminPermissions resolveAdminPermissions(AppUser user, UserType userType, AdminPermissionsDto dto) {
        if (userType != UserType.ADMIN && userType != UserType.VOLUNTARIO) {
            return null;
        }
        if (dto == null) {
            // requisicao sem permissoes (ex.: edicao de dados cadastrais) preserva o que ja estava salvo
            if (user.getAdminPermissions() != null && user.getUserType() == userType) {
                return user.getAdminPermissions();
            }
            return userType == UserType.ADMIN
                ? AdminPermissions.defaultsForNewAdmin()
                : AdminPermissions.defaultsForVolunteer();
        }
        boolean isAdmin = userType == UserType.ADMIN;
        return new AdminPermissions(
            Boolean.TRUE.equals(dto.manageAnimals()),
            Boolean.TRUE.equals(dto.approveAdoptions()),
            isAdmin && Boolean.TRUE.equals(dto.manageSettings()),
            isAdmin && Boolean.TRUE.equals(dto.manageAdmins()),
            Boolean.TRUE.equals(dto.manageUsers())
        );
    }

    private AdminPermissionsDto toPermissionsDto(AppUser user) {
        if (user.getUserType() != UserType.ADMIN && user.getUserType() != UserType.VOLUNTARIO) {
            return null;
        }
        AdminPermissions permissions = AdminPermissions.effectiveFor(user);
        return new AdminPermissionsDto(
            permissions.isManageAnimals(),
            permissions.isApproveAdoptions(),
            permissions.isManageSettings(),
            permissions.isManageAdmins(),
            permissions.isManageUsers()
        );
    }

    private UserType parseUserType(String rawUserType) {
        try {
            return UserType.valueOf(rawUserType.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Tipo de usuario invalido. Use ADOTANTE, VOLUNTARIO ou ADMIN.");
        }
    }

    private void validateRolesByType(UserType userType, Set<Role> roles) {
        if (roles.size() != 1) {
            throw new BadRequestException("Cada usuario deve possuir exatamente um papel.");
        }

        String roleCode = roles.iterator().next().getCode();
        String expectedRole = userType.name();
        if (!expectedRole.equals(roleCode)) {
            throw new BadRequestException(
                "O tipo de usuario %s deve ter apenas o papel %s.".formatted(userType.name(), expectedRole)
            );
        }
    }

    private Organization resolveOrganization(UUID organizationId) {
        if (organizationId == null) {
            return null;
        }
        return organizationRepository.findById(organizationId)
            .orElseThrow(() -> new NotFoundException("Organizacao nao encontrada"));
    }

    private void validateOrganizationByType(UserType userType, Organization organization) {
        if (userType == UserType.VOLUNTARIO && organization == null) {
            throw new BadRequestException("Usuario VOLUNTARIO deve estar vinculado a uma ONG.");
        }
    }

    private void upsertCredential(AppUser user, UpsertUserRequest request, boolean creating) {
        if (user.getUserType() != UserType.VOLUNTARIO && user.getUserType() != UserType.ADMIN) {
            return;
        }

        String password = request.password();
        String userLabel = user.getUserType() == UserType.ADMIN ? "administrador" : "voluntario";
        if (creating && (password == null || password.isBlank())) {
            throw new BadRequestException("Senha e obrigatoria para cadastro de " + userLabel + ".");
        }

        UserCredential existingCredential = userCredentialRepository.findByUserId(user.getId()).orElse(null);
        if (!creating && existingCredential == null && (password == null || password.isBlank())) {
            throw new BadRequestException(
                "Este " + userLabel + " ainda nao possui senha. Informe uma senha para habilitar o login."
            );
        }

        if (password == null || password.isBlank()) {
            return;
        }

        UserCredential credential = existingCredential != null ? existingCredential : new UserCredential();
        credential.setUser(user);
        credential.setPasswordHash(passwordEncoder.encode(password));
        userCredentialRepository.save(credential);
    }

    private UserResponse toResponse(AppUser user) {
        return toResponse(user, null);
    }

    private UserResponse toResponse(AppUser user, AdopterProfileResponse adopterProfile) {
        Organization organization = user.getOrganization();
        UUID organizationId = organization != null ? organization.getId() : null;
        String organizationName = organization != null ? organization.getLegalName() : null;

        return new UserResponse(
            user.getId(),
            user.getAuthSubject(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getUserType().name(),
            user.getAddressLine(),
            user.getAddressNumber(),
            user.getNeighborhood(),
            user.getCity(),
            user.getState(),
            user.getZipCode(),
            organizationId,
            organizationName,
            user.isOrganizationResponsible(),
            user.getRoles().stream().map(Role::getCode).sorted().toList(),
            toPermissionsDto(user),
            user.getCreatedAt(),
            adopterProfile
        );
    }

    private AdopterProfileResponse toAdopterProfileResponse(AdopterProfile profile) {
        return new AdopterProfileResponse(
            profile.getId(),
            profile.getUser().getId(),
            profile.getHousingType(),
            profile.getOwnershipType(),
            profile.getRentAllowsPets(),
            profile.getHasYard(),
            profile.getYardWalled(),
            profile.getHasWindowScreens(),
            profile.getResidentsCount(),
            profile.getHasChildren(),
            profile.getChildrenAges(),
            profile.getHadPetsBefore(),
            profile.getCurrentlyHasPets(),
            profile.getCurrentPetsCount(),
            profile.getCurrentPetsTypes(),
            profile.getReturnedAnimal(),
            profile.getPetsVaccinated(),
            profile.getPetsNeutered(),
            profile.getAwareOfCosts(),
            profile.getMonthlyBudget(),
            profile.getWillCoverVaccines(),
            profile.getWillCoverNeutering(),
            profile.getWillCoverEmergencies(),
            profile.getReasonToAdopt(),
            profile.getHoursAloneDaily(),
            profile.getIfDestroyed(),
            profile.getIfSick(),
            profile.getWillAdapt(),
            profile.getEnvironmentPhotoUrl(),
            profile.getEnvironmentVideoUrl(),
            profile.getUpdatedAt()
        );
    }
}
