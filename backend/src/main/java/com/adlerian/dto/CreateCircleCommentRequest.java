package com.adlerian.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateCircleCommentRequest {
    @NotBlank(message = "评论内容不能为空")
    private String content;

    private Long parentId;
}
