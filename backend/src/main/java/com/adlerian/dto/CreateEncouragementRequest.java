package com.adlerian.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateEncouragementRequest {
    @NotBlank(message = "鼓励文字不能为空，请写下你的鼓励")
    private String message;

    private boolean anonymous;
}
