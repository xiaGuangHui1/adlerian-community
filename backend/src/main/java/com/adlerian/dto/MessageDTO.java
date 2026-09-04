package com.adlerian.dto;

import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MessageDTO {
    private Long id;
    private UUID senderId;
    private String content;
    private boolean read;
    private Instant createdAt;
}
