package com.apollopet.adotei.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "system_parameter")
@Getter
@Setter
@NoArgsConstructor
public class SystemParameter extends BaseEntity {

    @Column(nullable = false)
    private String category;

    @Column(name = "parameter_key", nullable = false)
    private String parameterKey;

    @Column(name = "parameter_value", nullable = false)
    private String parameterValue;

    private String description;

    @Column(nullable = false)
    private boolean active = true;
}
