package com.adlerian.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreatePostRequest {
    @NotBlank(message = "标题不能为空")
    @Size(max = 200, message = "标题最多200字")
    private String title;

    @NotBlank(message = "内容不能为空")
    private String content;

    @NotBlank(message = "请选择话题分类")
    private String category;
}
