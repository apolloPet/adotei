package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.Tutor;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TutorRepository extends JpaRepository<Tutor, UUID> {
}
