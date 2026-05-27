package com.adlerian.dto;

import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EncouragementDTO {
    private Long id;
    private PostDTO.AuthorDTO sender;
    private String message;
    private boolean anonymous;
    private Instant createdAt;
}
