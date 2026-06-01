package com.adlerian.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateCommentRequest {
    @NotBlank(message = "评论内容不能为空")
    private String content;

    /** 父评论ID，null表示顶级评论 */
    private Long parentId;

    /** 评论标签，null 表示普通评论 */
    private String tag;
}
