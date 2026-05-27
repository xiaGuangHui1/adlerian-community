package com.adlerian.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityItemDTO {
    private String type;        // "post" | "comment" | "checkin"
    private String description; // e.g. "xxx 发表了新帖子"
    private String title;       // 帖子/打卡标题
    private Long targetId;      // 跳转用id
    private Instant createdAt;
}
