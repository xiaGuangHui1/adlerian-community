package com.adlerian.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "circle_members")
@IdClass(CircleMemberId.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CircleMember {

    @Id
    @Column(name = "circle_id")
    private Long circleId;

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "joined_at", updatable = false)
    private Instant joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = Instant.now();
    }
}
