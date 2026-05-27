package com.adlerian.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResourceDTO {
    private Long id;
    private String title;
    private String description;
    private String type;
    private String content;
    private String coverUrl;
    private Instant createdAt;
}
