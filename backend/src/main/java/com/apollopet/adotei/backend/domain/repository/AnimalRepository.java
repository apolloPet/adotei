package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.Animal;
import com.apollopet.adotei.backend.domain.entity.AnimalStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnimalRepository extends JpaRepository<Animal, UUID> {

    long countByOrganization_Id(UUID organizationId);

    List<Animal> findByStatus(AnimalStatus status);
}
