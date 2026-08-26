package com.adlerian.dto;

import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckInFeedDTO {
    private Long id;
    private LocalDate checkinDate;
    private String content;
    private Instant createdAt;
    private PostDTO.AuthorDTO author;
    private int encouragementCount;
}
