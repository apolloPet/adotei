package com.apollopet.adotei.backend.web;

import com.apollopet.adotei.backend.application.service.UserService;
import com.apollopet.adotei.backend.web.dto.UserDtos.UpsertAdopterProfileRequest;
import com.apollopet.adotei.backend.web.dto.UserDtos.UpdateOwnProfileRequest;
import com.apollopet.adotei.backend.web.dto.UserDtos.UpsertUserRequest;
import com.apollopet.adotei.backend.web.dto.UserDtos.UserResponse;
import com.apollopet.adotei.backend.web.dto.UserDtos.UserTypeResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public List<UserResponse> list() {
        return userService.list();
    }

    @GetMapping("/organization/{organizationId}/volunteers")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public List<UserResponse> listVolunteersByOrganization(@PathVariable UUID organizationId) {
        return userService.listVolunteersByOrganization(organizationId);
    }

    @GetMapping("/types")
    public List<UserTypeResponse> listTypes() {
        return userService.listUserTypes();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public UserResponse get(@PathVariable UUID id) {
        return userService.get(id);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserResponse me(Authentication authentication) {
        return userService.getByAuthSubject(authentication.getName());
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserResponse updateMe(Authentication authentication, @Valid @RequestBody UpdateOwnProfileRequest request) {
        return userService.updateOwnProfile(authentication.getName(), request);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse create(@Valid @RequestBody UpsertUserRequest request) {
        return userService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse update(@PathVariable UUID id, @Valid @RequestBody UpsertUserRequest request) {
        return userService.update(id, request);
    }

    @PutMapping("/{id}/adopter-profile")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO','ADOTANTE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void upsertAdopterProfile(@PathVariable UUID id, @RequestBody UpsertAdopterProfileRequest request) {
        userService.upsertAdopterProfile(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable UUID id) {
        userService.delete(id);
    }
}
