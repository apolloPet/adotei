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

    public AppUser require(String authSubject, AdminPermission permission) {
        AppUser requester = appUserRepository.findByAuthSubject(authSubject)
            .orElseThrow(() -> new NotFoundException("Usuario autenticado nao encontrado"));

        if (requester.getUserType() == UserType.VOLUNTARIO) {
            return requester;
        }

        if (requester.getUserType() != UserType.ADMIN) {
            throw new AccessDeniedException("Apenas administradores ou voluntarios podem executar esta acao.");
        }

        AdminPermissions permissions = requester.getAdminPermissions();
        if (permissions == null) {
            permissions = AdminPermissions.fullAccess();
        }

        if (!permissions.allows(permission)) {
            throw new AccessDeniedException("Administrador sem permissao: " + permission.name());
        }

        return requester;
    }

    public void requireAdminPermission(String authSubject, AdminPermission permission) {
        AppUser requester = appUserRepository.findByAuthSubject(authSubject)
            .orElseThrow(() -> new NotFoundException("Usuario autenticado nao encontrado"));

        if (requester.getUserType() != UserType.ADMIN) {
            throw new AccessDeniedException("Apenas administradores podem executar esta acao.");
        }

        AdminPermissions permissions = requester.getAdminPermissions();
        if (permissions == null) {
            permissions = AdminPermissions.fullAccess();
        }

        if (!permissions.allows(permission)) {
            throw new AccessDeniedException("Administrador sem permissao: " + permission.name());
        }
    }
}
