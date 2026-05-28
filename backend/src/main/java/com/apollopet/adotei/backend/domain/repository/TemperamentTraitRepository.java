package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.TemperamentTrait;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TemperamentTraitRepository extends JpaRepository<TemperamentTrait, UUID> {
    Optional<TemperamentTrait> findByCode(String code);
}
