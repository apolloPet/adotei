package com.apollopet.adotei.backend.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.Organization;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AnimalRepository;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import com.apollopet.adotei.backend.domain.repository.OrganizationRepository;
import com.apollopet.adotei.backend.web.dto.OrganizationProfileDtos.UpdateOrganizationProfileRequest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
class OrganizationProfileServiceTest {

    @Mock private OrganizationRepository organizationRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private AnimalRepository animalRepository;

    @Test
    void devePermitirVoluntarioResponsavelEditarPropriaOng() {
        OrganizationProfileService service = new OrganizationProfileService(
            organizationRepository,
            appUserRepository,
            animalRepository
        );

        UUID orgId = UUID.randomUUID();
        Organization organization = buildOrganization(orgId);
        AppUser volunteer = buildVolunteer(orgId, true);

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(appUserRepository.findByAuthSubject("volunteer-auth")).thenReturn(Optional.of(volunteer));
        when(organizationRepository.save(organization)).thenReturn(organization);
        when(appUserRepository.findByOrganizationIdAndUserType(orgId, UserType.VOLUNTARIO)).thenReturn(List.of(volunteer));
        when(animalRepository.countByOrganization_Id(orgId)).thenReturn(3L);

        var response = service.updateProfile(
            orgId,
            "volunteer-auth",
            new UpdateOrganizationProfileRequest(
                "ONG Atualizada",
                "ONG Amigos",
                null,
                "Maria Responsavel",
                null,
                "(11) 99999-9999",
                null,
                "contato@ong.com",
                "Rua A, 10",
                "Sao Paulo",
                "SP",
                "Sobre a ong",
                "Historia da ong",
                2015,
                "Adocao",
                "Abrigo",
                null,
                null,
                null,
                null,
                true
            )
        );

        assertEquals("ONG Amigos", response.displayName());
        assertEquals("Sobre a ong", response.aboutText());
    }

    @Test
    void deveBloquearVoluntarioNaoResponsavel() {
        OrganizationProfileService service = new OrganizationProfileService(
            organizationRepository,
            appUserRepository,
            animalRepository
        );

        UUID orgId = UUID.randomUUID();
        Organization organization = buildOrganization(orgId);
        AppUser volunteer = buildVolunteer(orgId, false);

        when(organizationRepository.findById(orgId)).thenReturn(Optional.of(organization));
        when(appUserRepository.findByAuthSubject("volunteer-auth")).thenReturn(Optional.of(volunteer));

        assertThrows(
            AccessDeniedException.class,
            () -> service.updateProfile(orgId, "volunteer-auth", sampleRequest())
        );
    }

    private UpdateOrganizationProfileRequest sampleRequest() {
        return new UpdateOrganizationProfileRequest(
            "ONG",
            null,
            null,
            "Contato",
            null,
            "(11) 99999-9999",
            null,
            null,
            null,
            "Sao Paulo",
            "SP",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        );
    }

    private Organization buildOrganization(UUID id) {
        Organization organization = new Organization();
        organization.setLegalName("ONG Teste");
        organization.setPrimaryContactName("Contato");
        organization.setContactPhone1("(11) 99999-9999");
        organization.setCity("Sao Paulo");
        organization.setPublished(true);
        setEntityId(organization, id);
        return organization;
    }

    private AppUser buildVolunteer(UUID orgId, boolean responsible) {
        Organization organization = buildOrganization(orgId);
        AppUser user = new AppUser();
        user.setUserType(UserType.VOLUNTARIO);
        user.setOrganization(organization);
        user.setOrganizationResponsible(responsible);
        user.setFullName("Voluntario");
        user.setEmail("vol@adotei.com");
        user.setAuthSubject("volunteer-auth");
        setEntityId(user, UUID.randomUUID());
        return user;
    }

    private void setEntityId(Object entity, UUID id) {
        try {
            var field = entity.getClass().getSuperclass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception ignored) {
            // helper for tests
        }
    }
}
