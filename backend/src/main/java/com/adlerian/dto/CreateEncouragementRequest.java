package com.adlerian.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateEncouragementRequest {
    @NotBlank(message = "谢谢不能为空，请写下你的感谢")
    private String message;

    private boolean anonymous;
}
