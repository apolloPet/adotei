package com.apollopet.adotei.backend.application.service;

import com.apollopet.adotei.backend.application.exception.BadRequestException;
import com.apollopet.adotei.backend.application.exception.NotFoundException;
import com.apollopet.adotei.backend.domain.entity.AdopterProfile;
import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.Role;
import com.apollopet.adotei.backend.domain.entity.UserCredential;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AdopterProfileRepository;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import com.apollopet.adotei.backend.domain.repository.RoleRepository;
import com.apollopet.adotei.backend.domain.repository.UserCredentialRepository;
import com.apollopet.adotei.backend.web.dto.AuthDtos.AuthResponse;
import com.apollopet.adotei.backend.web.dto.AuthDtos.ChangePasswordRequest;
import com.apollopet.adotei.backend.web.dto.AuthDtos.LoginRequest;
import com.apollopet.adotei.backend.web.dto.AuthDtos.RegisterRequest;
import com.apollopet.adotei.backend.web.dto.AuthDtos.UserSession;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final AdopterProfileRepository adopterProfileRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final long tokenExpirationMinutes;

    public AuthService(
        AppUserRepository appUserRepository,
        RoleRepository roleRepository,
        AdopterProfileRepository adopterProfileRepository,
        UserCredentialRepository userCredentialRepository,
        PasswordEncoder passwordEncoder,
        JwtEncoder jwtEncoder,
        @Value("${app.security.jwt.expiration-minutes:120}") long tokenExpirationMinutes
    ) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.adopterProfileRepository = adopterProfileRepository;
        this.userCredentialRepository = userCredentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.tokenExpirationMinutes = tokenExpirationMinutes;
    }

    @Transactional
    public void register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (appUserRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Este email ja esta cadastrado.");
        }

        Role adopterRole = roleRepository.findByCode("ADOTANTE")
            .orElseThrow(() -> new NotFoundException("Role ADOTANTE nao encontrada"));

        AppUser user = new AppUser();
        user.setAuthSubject(normalizedEmail);
        user.setEmail(normalizedEmail);
        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone());
        user.setUserType(UserType.ADOTANTE);
        user.setAddressLine(request.addressLine());
        user.setAddressNumber(request.addressNumber());
        user.setNeighborhood(request.neighborhood());
        user.setCity(request.city());
        user.setState(request.state());
        user.setZipCode(request.zipCode());
        user.setRoles(Set.of(adopterRole));
        AppUser savedUser = appUserRepository.save(user);

        UserCredential credential = new UserCredential();
        credential.setUser(savedUser);
        credential.setPasswordHash(passwordEncoder.encode(request.password()));
        userCredentialRepository.save(credential);

        AdopterProfile adopterProfile = new AdopterProfile();
        adopterProfile.setUser(savedUser);
        adopterProfile.setHousingType(request.housingType());
        adopterProfile.setHasChildren(request.hasChildren());
        adopterProfile.setChildrenAges(request.childrenAges());
        adopterProfile.setHadPetsBefore(request.hadPetsBefore());
        adopterProfile.setCurrentlyHasPets(request.currentlyHasPets());
        adopterProfile.setCurrentPetsTypes(request.currentPetsTypes());
        adopterProfile.setHoursAloneDaily(request.hoursAloneDaily());
        adopterProfile.setWillCoverVaccines(request.willCoverVaccines());
        adopterProfile.setWillCoverEmergencies(request.willCoverEmergencies());
        adopterProfile.setAwareOfCosts(request.awareOfCosts());
        adopterProfileRepository.save(adopterProfile);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        AppUser user = appUserRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new BadRequestException("Credenciais invalidas."));

        UserCredential credential = userCredentialRepository.findByUserId(user.getId())
            .orElseThrow(() -> new BadRequestException("Credenciais invalidas."));

        if (!passwordEncoder.matches(request.password(), credential.getPasswordHash())) {
            throw new BadRequestException("Credenciais invalidas.");
        }

        return buildResponse(user);
    }

    @Transactional(readOnly = true)
    public UserSession getCurrentUser(String authSubject) {
        AppUser user = appUserRepository.findByAuthSubject(authSubject)
            .orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));
        return toSession(user);
    }

    @Transactional
    public void changePassword(String authSubject, ChangePasswordRequest request) {
        AppUser user = appUserRepository.findByAuthSubject(authSubject)
            .orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));

        UserCredential credential = userCredentialRepository.findByUserId(user.getId())
            .orElseThrow(() -> new BadRequestException("Credenciais do usuario nao encontradas."));

        if (!passwordEncoder.matches(request.currentPassword(), credential.getPasswordHash())) {
            throw new BadRequestException("Senha atual incorreta.");
        }

        credential.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userCredentialRepository.save(credential);
    }

    private AuthResponse buildResponse(AppUser user) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusSeconds(tokenExpirationMinutes * 60);
        List<String> roles = user.getRoles().stream().map(Role::getCode).sorted().toList();

        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuedAt(issuedAt)
            .expiresAt(expiresAt)
            .subject(user.getAuthSubject())
            .claim("roles", roles)
            .claim("user_id", user.getId().toString())
            .claim("email", user.getEmail())
            .build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
            .getTokenValue();

        return new AuthResponse(token, expiresAt, toSession(user));
    }

    private UserSession toSession(AppUser user) {
        return new UserSession(
            user.getId(),
            user.getAuthSubject(),
            user.getFullName(),
            user.getEmail(),
            user.getUserType().name(),
            user.getRoles().stream().map(Role::getCode).sorted().toList()
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
