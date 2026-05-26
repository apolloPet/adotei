package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.AdoptionRequirement;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdoptionRequirementRepository extends JpaRepository<AdoptionRequirement, UUID> {
    Optional<AdoptionRequirement> findByCode(String code);
}
