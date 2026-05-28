package com.apollopet.adotei.backend.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "adopter_profile")
public class AdopterProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser user;

    private String housingType;
    private String ownershipType;
    private Boolean rentAllowsPets;
    private Boolean hasYard;
    private Boolean yardWalled;
    private Boolean hasWindowScreens;
    private Integer residentsCount;
    private Boolean hasChildren;
    private String childrenAges;
    private Boolean hadPetsBefore;
    private Boolean currentlyHasPets;
    private Integer currentPetsCount;
    private String currentPetsTypes;
    private Boolean returnedAnimal;
    private Boolean petsVaccinated;
    private Boolean petsNeutered;
    private Boolean awareOfCosts;
    private String monthlyBudget;
    private Boolean willCoverVaccines;
    private Boolean willCoverNeutering;
    private Boolean willCoverEmergencies;
    private String reasonToAdopt;
    private Integer hoursAloneDaily;
    private String ifDestroyed;
    private String ifSick;
    private Boolean willAdapt;
    private String environmentPhotoUrl;
    private String environmentVideoUrl;

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public String getHousingType() {
        return housingType;
    }

    public void setHousingType(String housingType) {
        this.housingType = housingType;
    }

    public String getOwnershipType() {
        return ownershipType;
    }

    public void setOwnershipType(String ownershipType) {
        this.ownershipType = ownershipType;
    }

    public Boolean getRentAllowsPets() {
        return rentAllowsPets;
    }

    public void setRentAllowsPets(Boolean rentAllowsPets) {
        this.rentAllowsPets = rentAllowsPets;
    }

    public Boolean getHasYard() {
        return hasYard;
    }

    public void setHasYard(Boolean hasYard) {
        this.hasYard = hasYard;
    }

    public Boolean getYardWalled() {
        return yardWalled;
    }

    public void setYardWalled(Boolean yardWalled) {
        this.yardWalled = yardWalled;
    }

    public Boolean getHasWindowScreens() {
        return hasWindowScreens;
    }

    public void setHasWindowScreens(Boolean hasWindowScreens) {
        this.hasWindowScreens = hasWindowScreens;
    }

    public Integer getResidentsCount() {
        return residentsCount;
    }

    public void setResidentsCount(Integer residentsCount) {
        this.residentsCount = residentsCount;
    }

    public Boolean getHasChildren() {
        return hasChildren;
    }

    public void setHasChildren(Boolean hasChildren) {
        this.hasChildren = hasChildren;
    }

    public String getChildrenAges() {
        return childrenAges;
    }

    public void setChildrenAges(String childrenAges) {
        this.childrenAges = childrenAges;
    }

    public Boolean getHadPetsBefore() {
        return hadPetsBefore;
    }

    public void setHadPetsBefore(Boolean hadPetsBefore) {
        this.hadPetsBefore = hadPetsBefore;
    }

    public Boolean getCurrentlyHasPets() {
        return currentlyHasPets;
    }

    public void setCurrentlyHasPets(Boolean currentlyHasPets) {
        this.currentlyHasPets = currentlyHasPets;
    }

    public Integer getCurrentPetsCount() {
        return currentPetsCount;
    }

    public void setCurrentPetsCount(Integer currentPetsCount) {
        this.currentPetsCount = currentPetsCount;
    }

    public String getCurrentPetsTypes() {
        return currentPetsTypes;
    }

    public void setCurrentPetsTypes(String currentPetsTypes) {
        this.currentPetsTypes = currentPetsTypes;
    }

    public Boolean getReturnedAnimal() {
        return returnedAnimal;
    }

    public void setReturnedAnimal(Boolean returnedAnimal) {
        this.returnedAnimal = returnedAnimal;
    }

    public Boolean getPetsVaccinated() {
        return petsVaccinated;
    }

    public void setPetsVaccinated(Boolean petsVaccinated) {
        this.petsVaccinated = petsVaccinated;
    }

    public Boolean getPetsNeutered() {
        return petsNeutered;
    }

    public void setPetsNeutered(Boolean petsNeutered) {
        this.petsNeutered = petsNeutered;
    }

    public Boolean getAwareOfCosts() {
        return awareOfCosts;
    }

    public void setAwareOfCosts(Boolean awareOfCosts) {
        this.awareOfCosts = awareOfCosts;
    }

    public String getMonthlyBudget() {
        return monthlyBudget;
    }

    public void setMonthlyBudget(String monthlyBudget) {
        this.monthlyBudget = monthlyBudget;
    }

    public Boolean getWillCoverVaccines() {
        return willCoverVaccines;
    }

    public void setWillCoverVaccines(Boolean willCoverVaccines) {
        this.willCoverVaccines = willCoverVaccines;
    }

    public Boolean getWillCoverNeutering() {
        return willCoverNeutering;
    }

    public void setWillCoverNeutering(Boolean willCoverNeutering) {
        this.willCoverNeutering = willCoverNeutering;
    }

    public Boolean getWillCoverEmergencies() {
        return willCoverEmergencies;
    }

    public void setWillCoverEmergencies(Boolean willCoverEmergencies) {
        this.willCoverEmergencies = willCoverEmergencies;
    }

    public String getReasonToAdopt() {
        return reasonToAdopt;
    }

    public void setReasonToAdopt(String reasonToAdopt) {
        this.reasonToAdopt = reasonToAdopt;
    }

    public Integer getHoursAloneDaily() {
        return hoursAloneDaily;
    }

    public void setHoursAloneDaily(Integer hoursAloneDaily) {
        this.hoursAloneDaily = hoursAloneDaily;
    }

    public String getIfDestroyed() {
        return ifDestroyed;
    }

    public void setIfDestroyed(String ifDestroyed) {
        this.ifDestroyed = ifDestroyed;
    }

    public String getIfSick() {
        return ifSick;
    }

    public void setIfSick(String ifSick) {
        this.ifSick = ifSick;
    }

    public Boolean getWillAdapt() {
        return willAdapt;
    }

    public void setWillAdapt(Boolean willAdapt) {
        this.willAdapt = willAdapt;
    }

    public String getEnvironmentPhotoUrl() {
        return environmentPhotoUrl;
    }

    public void setEnvironmentPhotoUrl(String environmentPhotoUrl) {
        this.environmentPhotoUrl = environmentPhotoUrl;
    }

    public String getEnvironmentVideoUrl() {
        return environmentVideoUrl;
    }

    public void setEnvironmentVideoUrl(String environmentVideoUrl) {
        this.environmentVideoUrl = environmentVideoUrl;
    }
}
