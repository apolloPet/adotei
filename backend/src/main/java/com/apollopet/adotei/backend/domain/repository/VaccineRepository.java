package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.Vaccine;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VaccineRepository extends JpaRepository<Vaccine, UUID> {
    Optional<Vaccine> findByCode(String code);
}
