package com.apollopet.adotei.backend.infrastructure.config;

import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.Role;
import com.apollopet.adotei.backend.domain.entity.UserCredential;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import com.apollopet.adotei.backend.domain.repository.RoleRepository;
import com.apollopet.adotei.backend.domain.repository.UserCredentialRepository;
import java.util.HashSet;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("local")
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);
    private static final String ADMIN_ROLE = "ADMIN";

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminBootstrapProperties properties;

    public AdminBootstrapRunner(
        AppUserRepository appUserRepository,
        RoleRepository roleRepository,
        UserCredentialRepository userCredentialRepository,
        PasswordEncoder passwordEncoder,
        AdminBootstrapProperties properties
    ) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.userCredentialRepository = userCredentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!properties.isEnabled()) {
            return;
        }

        Role adminRole = roleRepository.findByCode(ADMIN_ROLE).orElse(null);
        if (adminRole == null) {
            log.warn("Bootstrap admin ignorado: papel ADMIN nao encontrado.");
            return;
        }

        AppUser admin = appUserRepository.findByEmail(properties.getEmail())
            .or(() -> appUserRepository.findByAuthSubject(properties.getAuthSubject()))
            .orElseGet(AppUser::new);

        admin.setAuthSubject(properties.getAuthSubject());
        admin.setFullName(properties.getFullName());
        admin.setEmail(properties.getEmail());
        admin.setUserType(UserType.ADMIN);
        admin.setRoles(new HashSet<>(Set.of(adminRole)));

        AppUser persistedAdmin = appUserRepository.save(admin);
        UserCredential credential = userCredentialRepository.findByUserId(persistedAdmin.getId()).orElseGet(UserCredential::new);
        credential.setUser(persistedAdmin);
        credential.setPasswordHash(passwordEncoder.encode(properties.getPassword()));
        userCredentialRepository.save(credential);

        log.info("Usuario admin local garantido para {}", properties.getEmail());
    }
}
