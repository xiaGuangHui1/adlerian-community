package com.adlerian.controller;

import com.adlerian.dto.ChallengeDTO;
import com.adlerian.entity.User;
import com.adlerian.service.ChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    @GetMapping
    public ResponseEntity<List<ChallengeDTO>> getActiveChallenges() {
        UUID userId = currentUserIdOrNull();
        return ResponseEntity.ok(challengeService.getActiveChallenges(userId));
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<ChallengeDTO> enroll(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.enroll(id, currentUser().getId()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ChallengeDTO>> getMyChallenges() {
        return ResponseEntity.ok(challengeService.getMyChallenges(currentUser().getId()));
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private UUID currentUserIdOrNull() {
        try {
            return currentUser().getId();
        } catch (Exception e) {
            return null;
        }
    }
}
