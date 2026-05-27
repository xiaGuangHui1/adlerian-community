package com.adlerian.repository;

import com.adlerian.entity.ChallengeEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChallengeEnrollmentRepository extends JpaRepository<ChallengeEnrollment, Long> {
    List<ChallengeEnrollment> findByUserId(UUID userId);
    List<ChallengeEnrollment> findByChallengeId(Long challengeId);
    Optional<ChallengeEnrollment> findByChallengeIdAndUserId(Long challengeId, UUID userId);
}
