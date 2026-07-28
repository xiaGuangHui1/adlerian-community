package com.adlerian.dto;

import lombok.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CircleCommentDTO {
    private Long id;
    private String content;
    private PostDTO.AuthorDTO author;
    private Long parentId;
    private Instant createdAt;
    private List<CircleCommentDTO> replies;
}
