package com.adlerian.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CirclePostDTO {
    private Long id;
    private String title;
    private String content;
    private PostDTO.AuthorDTO author;
    private int viewCount;
    private int commentCount;
    private Instant createdAt;
    private Instant updatedAt;
}
