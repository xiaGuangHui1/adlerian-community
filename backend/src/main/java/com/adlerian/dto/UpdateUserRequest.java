package com.adlerian.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateUserRequest {
    private String nickname;
    private String avatarUrl;
    private String bio;
}
