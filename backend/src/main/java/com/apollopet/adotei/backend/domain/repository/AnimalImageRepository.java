package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.AnimalImage;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnimalImageRepository extends JpaRepository<AnimalImage, UUID> {
    List<AnimalImage> findByAnimalIdOrderByDisplayOrderAsc(UUID animalId);
    long countByAnimalId(UUID animalId);
}
