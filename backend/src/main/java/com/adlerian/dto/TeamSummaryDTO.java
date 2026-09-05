package com.adlerian.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TeamSummaryDTO {
    private Long id;
    private String name;
    private int memberCount;
    private int maxMembers;
    private String creatorNickname;
    private String creatorAvatarUrl;
    private String status;
}
