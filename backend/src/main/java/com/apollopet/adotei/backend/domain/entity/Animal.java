package com.apollopet.adotei.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "animal")
@Getter
@Setter
@NoArgsConstructor
public class Animal extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String animalType;

    private String breed;

    @Column(nullable = false)
    private Integer ageYears;

    @Column(nullable = false)
    private String sex;

    @Column(nullable = false)
    private String size;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private boolean sterilized;

    private String vaccinationStatus;
    private String veterinaryInfo;
    private String healthConditions;
    private boolean specialNeeds;
    private String specialNeedsDescription;
    private boolean goodWithChildren;
    private boolean goodWithOtherAnimals;
    private boolean goodWithSeniors;
    private String energyLevel;
    private String trainability;
    private String location;
    private String responsibleName;
    private String responsibleContact;
    private String tutorName;
    private String tutorContact;
    private String personalityTemperament;
    private String additionalInfo;

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne
    @JoinColumn(name = "tutor_id")
    private Tutor tutor;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private AppUser createdBy;

    @OneToMany(mappedBy = "animal")
    private Set<AnimalImage> images = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
        name = "animal_vaccine",
        joinColumns = @JoinColumn(name = "animal_id"),
        inverseJoinColumns = @JoinColumn(name = "vaccine_id")
    )
    private Set<Vaccine> vaccines = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "animal_temperament_trait",
        joinColumns = @JoinColumn(name = "animal_id"),
        inverseJoinColumns = @JoinColumn(name = "trait_id")
    )
    private Set<TemperamentTrait> temperamentTraits = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "animal_requirement",
        joinColumns = @JoinColumn(name = "animal_id"),
        inverseJoinColumns = @JoinColumn(name = "requirement_id")
    )
    private Set<AdoptionRequirement> requirements = new HashSet<>();

    @OneToOne(mappedBy = "animal")
    private AnimalAdopterProfile adopterProfile;
}
