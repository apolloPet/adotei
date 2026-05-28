package com.apollopet.adotei.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "temperament_trait")
@Getter
@Setter
@NoArgsConstructor
public class TemperamentTrait extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private boolean active = true;
}
