package com.adlerian.repository;

import com.adlerian.entity.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    List<Challenge> findByActiveTrueOrderByCreatedAtDesc();
}
