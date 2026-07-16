package com.apollopet.adotei.backend.application.service;

import com.apollopet.adotei.backend.application.exception.NotFoundException;
import com.apollopet.adotei.backend.domain.entity.AdminPermission;
import com.apollopet.adotei.backend.domain.entity.AdoptionRequirement;
import com.apollopet.adotei.backend.domain.entity.Organization;
import com.apollopet.adotei.backend.domain.entity.TemperamentTrait;
import com.apollopet.adotei.backend.domain.entity.Tutor;
import com.apollopet.adotei.backend.domain.entity.Vaccine;
import com.apollopet.adotei.backend.domain.repository.AdoptionRequirementRepository;
import com.apollopet.adotei.backend.domain.repository.OrganizationRepository;
import com.apollopet.adotei.backend.domain.repository.TemperamentTraitRepository;
import com.apollopet.adotei.backend.domain.repository.TutorRepository;
import com.apollopet.adotei.backend.domain.repository.VaccineRepository;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.AdoptionRequirementRequest;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.AdoptionRequirementResponse;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.OrganizationRequest;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.OrganizationResponse;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.TemperamentTraitRequest;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.TemperamentTraitResponse;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.TutorRequest;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.TutorResponse;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.VaccineRequest;
import com.apollopet.adotei.backend.web.dto.CatalogDtos.VaccineResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {

    private final TutorRepository tutorRepository;
    private final OrganizationRepository organizationRepository;
    private final VaccineRepository vaccineRepository;
    private final TemperamentTraitRepository temperamentTraitRepository;
    private final AdoptionRequirementRepository adoptionRequirementRepository;
    private final AdminPermissionGuard adminPermissionGuard;

    public CatalogService(
        TutorRepository tutorRepository,
        OrganizationRepository organizationRepository,
        VaccineRepository vaccineRepository,
        TemperamentTraitRepository temperamentTraitRepository,
        AdoptionRequirementRepository adoptionRequirementRepository,
        AdminPermissionGuard adminPermissionGuard
    ) {
        this.tutorRepository = tutorRepository;
        this.organizationRepository = organizationRepository;
        this.vaccineRepository = vaccineRepository;
        this.temperamentTraitRepository = temperamentTraitRepository;
        this.adoptionRequirementRepository = adoptionRequirementRepository;
        this.adminPermissionGuard = adminPermissionGuard;
    }

    public List<TutorResponse> listTutors() {
        return tutorRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public TutorResponse createTutor(TutorRequest request) {
        Tutor tutor = new Tutor();
        apply(tutor, request);
        return toResponse(tutorRepository.save(tutor));
    }

    @Transactional
    public TutorResponse updateTutor(UUID id, TutorRequest request) {
        Tutor tutor = tutorRepository.findById(id).orElseThrow(() -> new NotFoundException("Tutor nao encontrado"));
        apply(tutor, request);
        return toResponse(tutorRepository.save(tutor));
    }

    @Transactional
    public void deleteTutor(UUID id) {
        tutorRepository.deleteById(id);
    }

    public List<OrganizationResponse> listOrganizations() {
        return organizationRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public OrganizationResponse createOrganization(OrganizationRequest request, String requesterAuthSubject) {
        adminPermissionGuard.requireAdminPermission(requesterAuthSubject, AdminPermission.MANAGE_SETTINGS);
        Organization organization = new Organization();
        apply(organization, request);
        return toResponse(organizationRepository.save(organization));
    }

    @Transactional
    public OrganizationResponse updateOrganization(UUID id, OrganizationRequest request, String requesterAuthSubject) {
        adminPermissionGuard.requireAdminPermission(requesterAuthSubject, AdminPermission.MANAGE_SETTINGS);
        Organization organization = organizationRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Organizacao nao encontrada"));
        apply(organization, request);
        return toResponse(organizationRepository.save(organization));
    }

    @Transactional
    public void deleteOrganization(UUID id, String requesterAuthSubject) {
        adminPermissionGuard.requireAdminPermission(requesterAuthSubject, AdminPermission.MANAGE_SETTINGS);
        organizationRepository.deleteById(id);
    }

    public List<VaccineResponse> listVaccines() {
        return vaccineRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public VaccineResponse createVaccine(VaccineRequest request) {
        Vaccine vaccine = new Vaccine();
        apply(vaccine, request);
        return toResponse(vaccineRepository.save(vaccine));
    }

    @Transactional
    public VaccineResponse updateVaccine(UUID id, VaccineRequest request) {
        Vaccine vaccine = vaccineRepository.findById(id).orElseThrow(() -> new NotFoundException("Vacina nao encontrada"));
        apply(vaccine, request);
        return toResponse(vaccineRepository.save(vaccine));
    }

    @Transactional
    public void deleteVaccine(UUID id) {
        vaccineRepository.deleteById(id);
    }

    public List<TemperamentTraitResponse> listTraits() {
        return temperamentTraitRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public TemperamentTraitResponse createTrait(TemperamentTraitRequest request) {
        TemperamentTrait trait = new TemperamentTrait();
        apply(trait, request);
        return toResponse(temperamentTraitRepository.save(trait));
    }

    @Transactional
    public TemperamentTraitResponse updateTrait(UUID id, TemperamentTraitRequest request) {
        TemperamentTrait trait = temperamentTraitRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Traco nao encontrado"));
        apply(trait, request);
        return toResponse(temperamentTraitRepository.save(trait));
    }

    @Transactional
    public void deleteTrait(UUID id) {
        temperamentTraitRepository.deleteById(id);
    }

    public List<AdoptionRequirementResponse> listRequirements() {
        return adoptionRequirementRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public AdoptionRequirementResponse createRequirement(AdoptionRequirementRequest request) {
        AdoptionRequirement requirement = new AdoptionRequirement();
        apply(requirement, request);
        return toResponse(adoptionRequirementRepository.save(requirement));
    }

    @Transactional
    public AdoptionRequirementResponse updateRequirement(UUID id, AdoptionRequirementRequest request) {
        AdoptionRequirement requirement = adoptionRequirementRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Requisito nao encontrado"));
        apply(requirement, request);
        return toResponse(adoptionRequirementRepository.save(requirement));
    }

    @Transactional
    public void deleteRequirement(UUID id) {
        adoptionRequirementRepository.deleteById(id);
    }

    private void apply(Tutor tutor, TutorRequest request) {
        tutor.setFullName(request.fullName());
        tutor.setCpf(request.cpf());
        tutor.setCode(request.code());
        tutor.setContact(request.contact());
    }

    private TutorResponse toResponse(Tutor tutor) {
        return new TutorResponse(tutor.getId(), tutor.getFullName(), tutor.getCpf(), tutor.getCode(), tutor.getContact());
    }

    private void apply(Organization organization, OrganizationRequest request) {
        organization.setLegalName(request.legalName());
        organization.setCnpj(request.cnpj());
        organization.setPrimaryContactName(request.primaryContactName());
        organization.setSecondaryContactName(request.secondaryContactName());
        organization.setContactPhone1(request.contactPhone1());
        organization.setContactPhone2(request.contactPhone2());
        organization.setCity(request.city());
        organization.setState(request.state());
    }

    private OrganizationResponse toResponse(Organization organization) {
        return new OrganizationResponse(
            organization.getId(),
            organization.getLegalName(),
            organization.getCnpj(),
            organization.getPrimaryContactName(),
            organization.getSecondaryContactName(),
            organization.getContactPhone1(),
            organization.getContactPhone2(),
            organization.getCity(),
            organization.getState()
        );
    }

    private void apply(Vaccine vaccine, VaccineRequest request) {
        vaccine.setCode(request.code());
        vaccine.setName(request.name());
        vaccine.setAnimalType(request.animalType());
        vaccine.setActive(request.active());
    }

    private VaccineResponse toResponse(Vaccine vaccine) {
        return new VaccineResponse(vaccine.getId(), vaccine.getCode(), vaccine.getName(), vaccine.getAnimalType(), vaccine.isActive());
    }

    private void apply(TemperamentTrait trait, TemperamentTraitRequest request) {
        trait.setCode(request.code());
        trait.setDescription(request.description());
        trait.setActive(request.active());
    }

    private TemperamentTraitResponse toResponse(TemperamentTrait trait) {
        return new TemperamentTraitResponse(trait.getId(), trait.getCode(), trait.getDescription(), trait.isActive());
    }

    private void apply(AdoptionRequirement requirement, AdoptionRequirementRequest request) {
        requirement.setCode(request.code());
        requirement.setName(request.name());
        requirement.setActive(request.active());
    }

    private AdoptionRequirementResponse toResponse(AdoptionRequirement requirement) {
        return new AdoptionRequirementResponse(requirement.getId(), requirement.getCode(), requirement.getName(), requirement.isActive());
    }
}
