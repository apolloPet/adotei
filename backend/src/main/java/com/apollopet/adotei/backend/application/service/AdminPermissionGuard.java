package com.apollopet.adotei.backend.application.service;

import com.apollopet.adotei.backend.application.exception.NotFoundException;
import com.apollopet.adotei.backend.domain.entity.AdminPermission;
import com.apollopet.adotei.backend.domain.entity.AdminPermissions;
import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class AdminPermissionGuard {

    private final AppUserRepository appUserRepository;

    public AdminPermissionGuard(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    /** Exige a permissao de um administrador ou voluntario de ONG. */
    public AppUser require(String authSubject, AdminPermission permission) {
        AppUser requester = loadRequester(authSubject);

        if (requester.getUserType() != UserType.ADMIN && requester.getUserType() != UserType.VOLUNTARIO) {
            throw new AccessDeniedException("Apenas administradores ou voluntarios podem executar esta acao.");
        }

        assertAllows(requester, permission);
        return requester;
    }

    /** Exige a permissao de um administrador da plataforma. */
    public void requireAdminPermission(String authSubject, AdminPermission permission) {
        AppUser requester = loadRequester(authSubject);

        if (requester.getUserType() != UserType.ADMIN) {
            throw new AccessDeniedException("Apenas administradores podem executar esta acao.");
        }

        assertAllows(requester, permission);
    }

    private void assertAllows(AppUser requester, AdminPermission permission) {
        if (!AdminPermissions.effectiveFor(requester).allows(permission)) {
            throw new AccessDeniedException("Usuario sem permissao: " + permission.name());
        }
    }

    private AppUser loadRequester(String authSubject) {
        return appUserRepository.findByAuthSubject(authSubject)
            .orElseThrow(() -> new NotFoundException("Usuario autenticado nao encontrado"));
    }
}
