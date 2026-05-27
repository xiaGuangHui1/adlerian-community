package com.adlerian.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuoteDTO {
    private Long id;
    private String content;
    private String author;
    private String source;
    private Instant createdAt;
}
