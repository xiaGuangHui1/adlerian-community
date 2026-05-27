package com.adlerian.dto;

import lombok.*;
import java.time.Instant;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TeamDTO {
    private Long id;
    private String inviteCode;
    private String name;
    private String checkInTime;
    private int memberCount;
    private int maxMembers;
    private String status;
    private boolean todayAllCheckedIn;
    private long togetherDays;
    private long totalCheckIns;
    private List<TeamMemberDTO> members;
    private List<RecentActivityDTO> recentActivities;
    private Instant createdAt;
    private Instant activatedAt;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TeamMemberDTO {
        private String userId;
        private String nickname;
        private String avatarUrl;
        private boolean isCreator;
        private boolean todayCheckedIn;
        private String todayContent;
        private boolean isMe;
        private Instant joinedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RecentActivityDTO {
        private String userId;
        private String nickname;
        private String content;
        private Instant createdAt;
        private String relativeTime;
    }
}
