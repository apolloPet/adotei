package com.apollopet.adotei.backend.web;

import com.apollopet.adotei.backend.application.service.UserService;
import com.apollopet.adotei.backend.web.dto.UserDtos.UpsertAdopterProfileRequest;
import com.apollopet.adotei.backend.web.dto.UserDtos.AdopterProfileResponse;
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
    public List<UserResponse> list(Authentication authentication) {
        return userService.list(authentication.getName());
    }

    @GetMapping("/organization/{organizationId}/volunteers")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public List<UserResponse> listVolunteersByOrganization(@PathVariable UUID organizationId, Authentication authentication) {
        return userService.listVolunteersByOrganization(organizationId, authentication.getName());
    }

    @GetMapping("/types")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserTypeResponse> listTypes() {
        return userService.listUserTypes();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public UserResponse get(@PathVariable UUID id, Authentication authentication) {
        return userService.get(id, authentication.getName());
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserResponse me(Authentication authentication) {
        return userService.getByAuthSubject(authentication.getName());
    }

    @GetMapping("/me/adopter-profile")
    @PreAuthorize("isAuthenticated()")
    public AdopterProfileResponse myAdopterProfile(Authentication authentication) {
        return userService.getAdopterProfileByAuthSubject(authentication.getName());
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserResponse updateMe(Authentication authentication, @Valid @RequestBody UpdateOwnProfileRequest request) {
        return userService.updateOwnProfile(authentication.getName(), request);
    }

    @PutMapping("/me/adopter-profile")
    @PreAuthorize("hasRole('ADOTANTE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void upsertMyAdopterProfile(Authentication authentication, @RequestBody UpsertAdopterProfileRequest request) {
        userService.upsertOwnAdopterProfile(authentication.getName(), request);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public UserResponse create(Authentication authentication, @Valid @RequestBody UpsertUserRequest request) {
        return userService.create(request, authentication.getName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public UserResponse update(
        @PathVariable UUID id,
        Authentication authentication,
        @Valid @RequestBody UpsertUserRequest request
    ) {
        return userService.update(id, request, authentication.getName());
    }

    @PutMapping("/{id}/adopter-profile")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void upsertAdopterProfile(
        @PathVariable UUID id,
        Authentication authentication,
        @RequestBody UpsertAdopterProfileRequest request
    ) {
        userService.upsertAdopterProfile(id, request, authentication.getName());
    }

    @GetMapping("/{id}/adopter-profile")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO','ADOTANTE')")
    public AdopterProfileResponse getAdopterProfile(@PathVariable UUID id, Authentication authentication) {
        return userService.getAdopterProfile(id, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public void delete(@PathVariable UUID id, Authentication authentication) {
        userService.delete(id, authentication.getName());
    }
}
