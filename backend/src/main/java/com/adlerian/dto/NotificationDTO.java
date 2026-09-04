package com.adlerian.dto;

import lombok.*;

import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationDTO {
    private Long id;
    private String type;
    private String actorNickname;
    private String actorAvatarUrl;
    private String targetType;
    private Long targetId;
    private String content;
    private boolean read;
    private Instant createdAt;
}
