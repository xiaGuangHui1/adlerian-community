package com.adlerian.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "teams")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invite_code", unique = true, nullable = false, length = 20)
    private String inviteCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "check_in_time", length = 5)
    @Builder.Default
    private String checkInTime = "20:00";

    @Column(name = "max_members")
    @Builder.Default
    private int maxMembers = 3;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private TeamStatus status = TeamStatus.PENDING;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "activated_at")
    private Instant activatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public enum TeamStatus {
        PENDING, ACTIVE, DISBANDED
    }
}
