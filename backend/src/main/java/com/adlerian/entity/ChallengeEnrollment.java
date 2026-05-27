package com.adlerian.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "challenge_enrollments",
       uniqueConstraints = @UniqueConstraint(columnNames = {"challenge_id", "user_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChallengeEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "challenge_id", nullable = false)
    private Long challengeId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "progress")
    private int progress;

    @Column(name = "completed")
    private boolean completed;

    @Column(name = "enrolled_at", updatable = false)
    private Instant enrolledAt;

    @PrePersist
    protected void onCreate() {
        enrolledAt = Instant.now();
    }
}
