package com.adlerian.dto;

import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private String category;
    private String source;
    private boolean pinned;
    private AuthorDTO author;
    private Instant createdAt;
    private Instant updatedAt;
    private int encouragementCount;
    private int commentCount;
    private int viewCount;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthorDTO {
        private UUID id;
        private String nickname;
        private String avatarUrl;
    }
}
