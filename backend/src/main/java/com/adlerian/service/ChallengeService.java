package com.adlerian.service;

import com.adlerian.dto.ChallengeDTO;
import com.adlerian.entity.Challenge;
import com.adlerian.entity.ChallengeEnrollment;
import com.adlerian.repository.ChallengeEnrollmentRepository;
import com.adlerian.repository.ChallengeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeEnrollmentRepository enrollmentRepository;

    public List<ChallengeDTO> getActiveChallenges(UUID userId) {
        return challengeRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream().map(c -> toDTO(c, userId)).toList();
    }

    public ChallengeDTO enroll(Long challengeId, UUID userId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("挑战不存在"));

        if (enrollmentRepository.findByChallengeIdAndUserId(challengeId, userId).isPresent()) {
            throw new RuntimeException("已加入该挑战");
        }

        ChallengeEnrollment enrollment = ChallengeEnrollment.builder()
                .challengeId(challengeId)
                .userId(userId)
                .progress(0)
                .completed(false)
                .build();
        enrollmentRepository.save(enrollment);

        return toDTO(challenge, userId);
    }

    public List<ChallengeDTO> getMyChallenges(UUID userId) {
        return enrollmentRepository.findByUserId(userId).stream()
                .map(e -> challengeRepository.findById(e.getChallengeId())
                        .map(c -> toDTO(c, userId))
                        .orElse(null))
                .filter(dto -> dto != null)
                .toList();
    }

    private ChallengeDTO toDTO(Challenge c, UUID userId) {
        ChallengeDTO.ChallengeDTOBuilder builder = ChallengeDTO.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .category(c.getCategory())
                .targetCount(c.getTargetCount())
                .icon(c.getIcon())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .active(c.isActive())
                .createdAt(c.getCreatedAt())
                .enrolled(false)
                .progress(0)
                .completed(false);

        if (userId != null) {
            enrollmentRepository.findByChallengeIdAndUserId(c.getId(), userId)
                    .ifPresent(e -> {
                        builder.enrolled(true)
                               .progress(e.getProgress())
                               .completed(e.isCompleted());
                    });
        }

        return builder.build();
    }
}
