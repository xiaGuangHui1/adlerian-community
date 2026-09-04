package com.adlerian.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_id", nullable = false)
    private UUID recipientId;

    /** comment / reply / encouragement / team */
    @Column(nullable = false, length = 30)
    private String type;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "actor_nickname", length = 50)
    private String actorNickname;

    @Column(name = "actor_avatar_url")
    private String actorAvatarUrl;

    @Column(name = "target_type", length = 30)
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_read")
    private boolean read;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
