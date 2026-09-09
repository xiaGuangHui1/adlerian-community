package com.adlerian.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateEncouragementRequest {
    @NotBlank(message = "Please write your thanks")
    private String message;

    private boolean anonymous;
}
