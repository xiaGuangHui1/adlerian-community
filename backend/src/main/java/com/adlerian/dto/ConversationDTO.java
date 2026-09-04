package com.adlerian.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConversationDTO {
    private Long id;
    private PostDTO.AuthorDTO otherUser;
    private String lastMessage;
    private Instant lastMessageAt;
    private long unreadCount;
}
