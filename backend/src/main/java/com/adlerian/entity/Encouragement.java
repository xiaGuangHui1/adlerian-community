package com.adlerian.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "encouragements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Encouragement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    /** post / comment / user */
    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    /** 鼓励文字 —— 必填，这是与"点赞"的根本区别 */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_anonymous")
    private boolean anonymous;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
