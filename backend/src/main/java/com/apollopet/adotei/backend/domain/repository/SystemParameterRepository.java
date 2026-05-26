package com.apollopet.adotei.backend.domain.repository;

import com.apollopet.adotei.backend.domain.entity.SystemParameter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemParameterRepository extends JpaRepository<SystemParameter, UUID> {
    List<SystemParameter> findByCategoryOrderByParameterKeyAsc(String category);
    Optional<SystemParameter> findByCategoryAndParameterKey(String category, String parameterKey);
}
