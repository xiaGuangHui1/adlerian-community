package com.adlerian.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateJournalRequest {
    @Size(max = 200, message = "标题最多200字")
    private String title;

    @NotBlank(message = "日记内容不能为空")
    private String content;

    private String templateType;

    private boolean isPublic;
}
