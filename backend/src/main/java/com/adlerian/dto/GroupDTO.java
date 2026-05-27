package com.adlerian.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GroupDTO {
    private Long id;
    private String name;
    private String description;
    private String category;
    private int maxMembers;
    private int currentMembers;
    private PostDTO.AuthorDTO creator;
    private Instant createdAt;
    private boolean joined;
}
