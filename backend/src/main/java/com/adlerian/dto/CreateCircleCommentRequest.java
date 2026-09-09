package com.adlerian.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateCircleCommentRequest {
    @NotBlank(message = "Content is required")
    private String content;

    private Long parentId;
}
