package com.apollopet.adotei.backend.web;

import com.apollopet.adotei.backend.application.service.SystemParameterService;
import com.apollopet.adotei.backend.web.dto.SystemParameterDtos.SystemParameterResponse;
import com.apollopet.adotei.backend.web.dto.SystemParameterDtos.UpsertSystemParameterRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system-parameters")
public class SystemParameterController {

    private final SystemParameterService service;

    public SystemParameterController(SystemParameterService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public List<SystemParameterResponse> list(@RequestParam(required = false) String category) {
        return service.list(category);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public SystemParameterResponse create(
        Authentication authentication,
        @Valid @RequestBody UpsertSystemParameterRequest request
    ) {
        return service.create(request, authentication.getName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public SystemParameterResponse update(
        @PathVariable UUID id,
        Authentication authentication,
        @Valid @RequestBody UpsertSystemParameterRequest request
    ) {
        return service.update(id, request, authentication.getName());
    }
}
