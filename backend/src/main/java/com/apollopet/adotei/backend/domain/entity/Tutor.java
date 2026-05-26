package com.apollopet.adotei.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tutor")
@Getter
@Setter
@NoArgsConstructor
public class Tutor extends BaseEntity {

    @Column(nullable = false)
    private String fullName;

    private String cpf;

    @Column(unique = true)
    private String code;

    @Column(nullable = false)
    private String contact;
}
