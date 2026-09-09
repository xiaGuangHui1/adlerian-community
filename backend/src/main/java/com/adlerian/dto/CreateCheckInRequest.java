package com.adlerian.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateCheckInRequest {

    @NotBlank(message = "Check-in content is required")
    @Size(max = 2000, message = "Check-in content must be at most 2000 characters")
    private String content;

    private boolean syncToForum;

    private String forumTitle;

    private String forumCategory;
}
