package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.AdoptionInterest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdoptionInterestRepository extends JpaRepository<AdoptionInterest, UUID> {

    Optional<AdoptionInterest> findByAnimalIdAndUserId(UUID animalId, UUID userId);

    @EntityGraph(attributePaths = {"user", "user.organization"})
    List<AdoptionInterest> findByAnimalIdOrderByCreatedAtDesc(UUID animalId);

    @Query("SELECT DISTINCT ai.animal.id FROM AdoptionInterest ai")
    List<UUID> findDistinctAnimalIdsWithInterests();

    @Query(
        "SELECT DISTINCT ai.animal.id FROM AdoptionInterest ai WHERE ai.animal.organization.id = :organizationId"
    )
    List<UUID> findDistinctAnimalIdsWithInterestsByOrganizationId(@Param("organizationId") UUID organizationId);

    @Query("SELECT DISTINCT ai.animal.id FROM AdoptionInterest ai WHERE ai.user.id = :userId")
    List<UUID> findDistinctAnimalIdsWithInterestsByUserId(@Param("userId") UUID userId);
}
