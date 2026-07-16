package com.apollopet.adotei.backend.application.service;

import com.apollopet.adotei.backend.application.exception.NotFoundException;
import com.apollopet.adotei.backend.domain.entity.AdminPermission;
import com.apollopet.adotei.backend.domain.entity.SystemParameter;
import com.apollopet.adotei.backend.domain.repository.SystemParameterRepository;
import com.apollopet.adotei.backend.web.dto.SystemParameterDtos.SystemParameterResponse;
import com.apollopet.adotei.backend.web.dto.SystemParameterDtos.UpsertSystemParameterRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SystemParameterService {

    private final SystemParameterRepository repository;
    private final AdminPermissionGuard adminPermissionGuard;

    public SystemParameterService(
        SystemParameterRepository repository,
        AdminPermissionGuard adminPermissionGuard
    ) {
        this.repository = repository;
        this.adminPermissionGuard = adminPermissionGuard;
    }

    public List<SystemParameterResponse> list(String category) {
        if (category == null || category.isBlank()) {
            return repository.findAll().stream().map(this::toResponse).toList();
        }
        return repository.findByCategoryOrderByParameterKeyAsc(category).stream().map(this::toResponse).toList();
    }

    @Transactional
    public SystemParameterResponse create(UpsertSystemParameterRequest request, String requesterAuthSubject) {
        adminPermissionGuard.requireAdminPermission(requesterAuthSubject, AdminPermission.MANAGE_SETTINGS);
        SystemParameter parameter = new SystemParameter();
        apply(parameter, request);
        return toResponse(repository.save(parameter));
    }

    @Transactional
    public SystemParameterResponse update(UUID id, UpsertSystemParameterRequest request, String requesterAuthSubject) {
        adminPermissionGuard.requireAdminPermission(requesterAuthSubject, AdminPermission.MANAGE_SETTINGS);
        SystemParameter parameter = repository.findById(id)
            .orElseThrow(() -> new NotFoundException("Parametro nao encontrado"));
        apply(parameter, request);
        return toResponse(repository.save(parameter));
    }

    private void apply(SystemParameter parameter, UpsertSystemParameterRequest request) {
        parameter.setCategory(request.category());
        parameter.setParameterKey(request.key());
        parameter.setParameterValue(request.value());
        parameter.setDescription(request.description());
        parameter.setActive(request.active());
    }

    private SystemParameterResponse toResponse(SystemParameter parameter) {
        return new SystemParameterResponse(
            parameter.getId(),
            parameter.getCategory(),
            parameter.getParameterKey(),
            parameter.getParameterValue(),
            parameter.getDescription(),
            parameter.isActive()
        );
    }
}
