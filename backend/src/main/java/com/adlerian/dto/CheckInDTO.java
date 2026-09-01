package com.adlerian.dto;

import lombok.*;
import java.time.Instant;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckInDTO {
    private Long id;
    private LocalDate checkinDate;
    private String content;
    private Long postId;
    private Instant createdAt;
    private Instant updatedAt;
}
