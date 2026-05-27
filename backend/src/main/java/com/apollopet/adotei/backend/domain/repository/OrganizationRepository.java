package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.Organization;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    List<Organization> findByPublishedTrueOrderByLegalNameAsc();
}
