package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.AnimalAdopterProfile;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnimalAdopterProfileRepository extends JpaRepository<AnimalAdopterProfile, UUID> {
    Optional<AnimalAdopterProfile> findByAnimalId(UUID animalId);
}
