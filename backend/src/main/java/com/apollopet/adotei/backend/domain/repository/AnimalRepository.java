package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.Animal;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnimalRepository extends JpaRepository<Animal, UUID> {

    long countByOrganization_Id(UUID organizationId);
}
