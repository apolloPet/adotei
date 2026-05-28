package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.AdopterProfile;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdopterProfileRepository extends JpaRepository<AdopterProfile, UUID> {
    Optional<AdopterProfile> findByUserId(UUID userId);
}
