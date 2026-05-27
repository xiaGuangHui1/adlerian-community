package com.adlerian.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JournalDTO {
    private Long id;
    private String title;
    private String content;
    private String templateType;
    private boolean isPublic;
    private PostDTO.AuthorDTO author;
    private Instant createdAt;
    private Instant updatedAt;
}
