package com.apollopet.adotei.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "organization")
@Getter
@Setter
@NoArgsConstructor
public class Organization extends BaseEntity {

    @Column(name = "legal_name", nullable = false)
    private String legalName;

    @Column(unique = true)
    private String cnpj;

    @Column(name = "primary_contact_name", nullable = false)
    private String primaryContactName;

    @Column(name = "secondary_contact_name")
    private String secondaryContactName;

    @Column(name = "contact_phone_1", nullable = false)
    private String contactPhone1;

    @Column(name = "contact_phone_2")
    private String contactPhone2;

    @Column(nullable = false)
    private String city;

    private String state;
}
