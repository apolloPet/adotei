package com.apollopet.adotei.backend.application.service;

import com.apollopet.adotei.backend.application.exception.NotFoundException;
import com.apollopet.adotei.backend.domain.entity.AdopterProfile;
import com.apollopet.adotei.backend.domain.entity.Animal;
import com.apollopet.adotei.backend.domain.entity.AnimalAdopterProfile;
import com.apollopet.adotei.backend.domain.entity.AppUser;
import com.apollopet.adotei.backend.domain.entity.UserType;
import com.apollopet.adotei.backend.domain.repository.AdopterProfileRepository;
import com.apollopet.adotei.backend.domain.repository.AnimalAdopterProfileRepository;
import com.apollopet.adotei.backend.domain.repository.AnimalRepository;
import com.apollopet.adotei.backend.domain.repository.AppUserRepository;
import com.apollopet.adotei.backend.web.dto.CompatibilityDtos.CompatibilityQuestionResult;
import com.apollopet.adotei.backend.web.dto.CompatibilityDtos.CompatibilityCandidateResponse;
import com.apollopet.adotei.backend.web.dto.CompatibilityDtos.CompatibilityScoreResponse;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompatibilityService {

    private final AnimalRepository animalRepository;
    private final AppUserRepository appUserRepository;
    private final AdopterProfileRepository adopterProfileRepository;
    private final AnimalAdopterProfileRepository animalAdopterProfileRepository;

    public CompatibilityService(
        AnimalRepository animalRepository,
        AppUserRepository appUserRepository,
        AdopterProfileRepository adopterProfileRepository,
        AnimalAdopterProfileRepository animalAdopterProfileRepository
    ) {
        this.animalRepository = animalRepository;
        this.appUserRepository = appUserRepository;
        this.adopterProfileRepository = adopterProfileRepository;
        this.animalAdopterProfileRepository = animalAdopterProfileRepository;
    }

    @Transactional(readOnly = true)
    public CompatibilityScoreResponse score(UUID animalId, UUID userId, String requesterAuthSubject) {
        AppUser requester = appUserRepository.findByAuthSubject(requesterAuthSubject)
            .orElseThrow(() -> new NotFoundException("Usuario autenticado nao encontrado"));
        if (requester.getUserType() == UserType.ADOTANTE && !requester.getId().equals(userId)) {
            throw new AccessDeniedException("Adotante pode consultar apenas sua propria compatibilidade.");
        }

        Animal animal = animalRepository.findById(animalId)
            .orElseThrow(() -> new NotFoundException("Animal nao encontrado"));
        if (requester.getUserType() == UserType.VOLUNTARIO) {
            if (requester.getOrganization() == null) {
                throw new AccessDeniedException("Voluntario sem ONG vinculada.");
            }
            if (
                animal.getOrganization() == null ||
                !requester.getOrganization().getId().equals(animal.getOrganization().getId())
            ) {
                throw new AccessDeniedException("Voluntario so pode consultar compatibilidade dos animais da propria ONG.");
            }
        }
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));
        AdopterProfile adopter = adopterProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new NotFoundException("Perfil de adotante nao encontrado"));
        AnimalAdopterProfile animalProfile = animalAdopterProfileRepository.findByAnimalId(animal.getId())
            .orElseThrow(() -> new NotFoundException("Perfil ideal do adotante para este animal nao encontrado"));

        List<CompatibilityQuestionResult> questions = new ArrayList<>();

        evaluateBooleanRequirement(
            questions,
            "yard",
            "Possui quintal quando exigido",
            adopter.getHasYard(),
            animalProfile.isRequiresYard()
        );
        evaluateBooleanRequirement(
            questions,
            "walled_yard",
            "Quintal murado quando exigido",
            adopter.getYardWalled(),
            animalProfile.isRequiresWalledYard()
        );
        evaluateBooleanRequirement(
            questions,
            "window_screens",
            "Tela em janelas quando exigido",
            adopter.getHasWindowScreens(),
            animalProfile.isRequiresWindowScreens()
        );

        if (adopter.getOwnershipType() != null) {
            boolean isRented = "rented".equalsIgnoreCase(adopter.getOwnershipType());
            boolean compatible = !isRented || (animalProfile.isAllowsRented() && Boolean.TRUE.equals(adopter.getRentAllowsPets()));
            questions.add(
                new CompatibilityQuestionResult(
                    "rented_policy",
                    "Compatibilidade com moradia alugada",
                    compatible,
                    isRented ? "rented:" + String.valueOf(adopter.getRentAllowsPets()) : adopter.getOwnershipType(),
                    String.valueOf(animalProfile.isAllowsRented())
                )
            );
        }

        if (adopter.getHasChildren() != null) {
            boolean adopterHasChildren = Boolean.TRUE.equals(adopter.getHasChildren());
            boolean compatible = !adopterHasChildren || animalProfile.isSuitableForChildren();
            questions.add(
                new CompatibilityQuestionResult(
                    "children",
                    "Compatibilidade com crianças",
                    compatible,
                    String.valueOf(adopterHasChildren),
                    String.valueOf(animalProfile.isSuitableForChildren())
                )
            );
        }

        if (adopter.getHadPetsBefore() != null) {
            boolean adopterExperienced = Boolean.TRUE.equals(adopter.getHadPetsBefore());
            boolean compatible = adopterExperienced || animalProfile.isSuitableForFirstTimers();
            questions.add(
                new CompatibilityQuestionResult(
                    "first_timers",
                    "Experiencia previa ou pet para iniciantes",
                    compatible,
                    String.valueOf(adopterExperienced),
                    String.valueOf(animalProfile.isSuitableForFirstTimers())
                )
            );
        }

        if (adopter.getWillCoverEmergencies() != null) {
            boolean adopterCoversEmergency = Boolean.TRUE.equals(adopter.getWillCoverEmergencies());
            boolean compatible = !animalProfile.isRequiresEmergencyBudget() || adopterCoversEmergency;
            questions.add(
                new CompatibilityQuestionResult(
                    "emergency_budget",
                    "Cobertura de emergencias veterinarias",
                    compatible,
                    String.valueOf(adopterCoversEmergency),
                    String.valueOf(animalProfile.isRequiresEmergencyBudget())
                )
            );
        }

        if (adopter.getHoursAloneDaily() != null && animalProfile.getMaxHoursAloneDaily() != null) {
            boolean compatible = adopter.getHoursAloneDaily() <= animalProfile.getMaxHoursAloneDaily();
            questions.add(
                new CompatibilityQuestionResult(
                    "hours_alone",
                    "Tempo maximo sozinho por dia",
                    compatible,
                    String.valueOf(adopter.getHoursAloneDaily()),
                    String.valueOf(animalProfile.getMaxHoursAloneDaily())
                )
            );
        }

        if (adopter.getMonthlyBudget() != null && animalProfile.getEstimatedMonthlyCost() != null) {
            boolean compatible = budgetRank(adopter.getMonthlyBudget()) >= budgetRank(animalProfile.getEstimatedMonthlyCost());
            questions.add(
                new CompatibilityQuestionResult(
                    "monthly_budget",
                    "Orcamento mensal estimado",
                    compatible,
                    adopter.getMonthlyBudget(),
                    animalProfile.getEstimatedMonthlyCost()
                )
            );
        }

        int totalAnswered = questions.size();
        int matched = (int) questions.stream().filter(CompatibilityQuestionResult::compatible).count();
        int scorePercent = totalAnswered == 0 ? 0 : (int) Math.round((matched * 100.0) / totalAnswered);

        return new CompatibilityScoreResponse(
            animalId,
            userId,
            scorePercent,
            matched,
            totalAnswered,
            questions
        );
    }

    @Transactional(readOnly = true)
    public List<CompatibilityCandidateResponse> listCandidates(UUID animalId, String requesterAuthSubject) {
        AppUser requester = appUserRepository.findByAuthSubject(requesterAuthSubject)
            .orElseThrow(() -> new NotFoundException("Usuario autenticado nao encontrado"));
        if (requester.getUserType() != UserType.ADMIN && requester.getUserType() != UserType.VOLUNTARIO) {
            throw new AccessDeniedException("Apenas administradores ou voluntarios podem listar candidatos.");
        }

        Animal animal = animalRepository.findById(animalId)
            .orElseThrow(() -> new NotFoundException("Animal nao encontrado"));
        if (requester.getUserType() == UserType.VOLUNTARIO) {
            if (requester.getOrganization() == null) {
                throw new AccessDeniedException("Voluntario sem ONG vinculada.");
            }
            if (
                animal.getOrganization() == null ||
                !requester.getOrganization().getId().equals(animal.getOrganization().getId())
            ) {
                throw new AccessDeniedException("Voluntario so pode consultar compatibilidade dos animais da propria ONG.");
            }
        }

        animalAdopterProfileRepository.findByAnimalId(animalId)
            .orElseThrow(() -> new NotFoundException("Perfil ideal do adotante para este animal nao encontrado"));

        return adopterProfileRepository.findAllByUser_UserType(UserType.ADOTANTE).stream()
            .map(profile -> {
                AppUser user = profile.getUser();
                CompatibilityScoreResponse score = score(animalId, user.getId(), requesterAuthSubject);
                return new CompatibilityCandidateResponse(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getCity(),
                    score.scorePercent(),
                    score.matchedCount(),
                    score.totalAnsweredCount(),
                    score.questions()
                );
            })
            .sorted(Comparator.comparing(CompatibilityCandidateResponse::scorePercent).reversed())
            .toList();
    }

    private void evaluateBooleanRequirement(
        List<CompatibilityQuestionResult> questions,
        String code,
        String label,
        Boolean adopterValue,
        boolean required
    ) {
        if (adopterValue == null) {
            return;
        }
        boolean compatible = !required || Boolean.TRUE.equals(adopterValue);
        questions.add(
            new CompatibilityQuestionResult(
                code,
                label,
                compatible,
                String.valueOf(adopterValue),
                String.valueOf(required)
            )
        );
    }

    private int budgetRank(String budget) {
        if (budget == null) {
            return 0;
        }
        return switch (budget) {
            case "600+" -> 3;
            case "300-600" -> 2;
            case "100-300" -> 1;
            default -> 0;
        };
    }
}
