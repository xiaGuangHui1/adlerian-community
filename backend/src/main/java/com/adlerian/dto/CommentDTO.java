package com.adlerian.dto;

import lombok.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommentDTO {
    private Long id;
    private String content;
    private PostDTO.AuthorDTO author;
    private Long parentId;
    private Instant createdAt;
    private List<CommentDTO> replies;
    private int encouragementCount;
    private String tag;
}
