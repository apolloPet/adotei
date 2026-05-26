package com.apollopet.adotei.backend.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "animal_adopter_profile")
@Getter
@Setter
@NoArgsConstructor
public class AnimalAdopterProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "animal_id", nullable = false, unique = true)
    private Animal animal;

    private String suitableHousing;
    private boolean requiresYard;
    private boolean requiresWalledYard;
    private boolean requiresWindowScreens;
    private boolean allowsRented = true;
    private String minResidentExperience;
    private boolean suitableForChildren = true;
    private boolean suitableForFirstTimers = true;
    private Integer maxHoursAloneDaily;
    private String estimatedMonthlyCost;
    private boolean requiresEmergencyBudget = true;
}
