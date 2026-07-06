package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.OrganizationPersonality;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationPersonalityRepository extends JpaRepository<OrganizationPersonality, UUID> {

    List<OrganizationPersonality> findByOrganizationIdAndActiveTrueOrderByNameAsc(UUID organizationId);

    List<OrganizationPersonality> findByOrganizationIdOrderByNameAsc(UUID organizationId);

    boolean existsByOrganizationIdAndNameIgnoreCase(UUID organizationId, String name);
}
