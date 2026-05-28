package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.UserCredential;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserCredentialRepository extends JpaRepository<UserCredential, UUID> {
    Optional<UserCredential> findByUserId(UUID userId);
}
