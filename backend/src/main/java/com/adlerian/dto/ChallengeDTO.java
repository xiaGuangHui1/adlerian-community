package com.adlerian.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChallengeDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private int targetCount;
    private String icon;
    private Instant startDate;
    private Instant endDate;
    private boolean active;
    private Instant createdAt;
    // enrollment info for current user
    private boolean enrolled;
    private int progress;
    private boolean completed;
}
