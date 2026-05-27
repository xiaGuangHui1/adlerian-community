package com.adlerian.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HomeStatsDTO {
    private long totalUsers;
    private long totalPosts;
    private long totalComments;
    private long totalEncouragements;
    private long todayCheckIns;
}
