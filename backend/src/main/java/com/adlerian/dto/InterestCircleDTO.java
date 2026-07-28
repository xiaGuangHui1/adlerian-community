package com.adlerian.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InterestCircleDTO {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String coverUrl;
    private int sortOrder;
    private int memberCount;
    private int postCount;
    private Instant createdAt;
    private boolean joined;
}
