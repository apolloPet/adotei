package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.UserType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    @EntityGraph(attributePaths = {"organization", "roles"})
    @Override
    List<AppUser> findAll();

    @EntityGraph(attributePaths = {"organization", "roles"})
    @Override
    Optional<AppUser> findById(UUID id);

    Optional<AppUser> findByAuthSubject(String authSubject);
    Optional<AppUser> findByEmail(String email);

    @EntityGraph(attributePaths = {"organization", "roles"})
    List<AppUser> findByOrganizationIdAndUserType(UUID organizationId, UserType userType);

    boolean existsByEmail(String email);
}
