package com.adlerian.entity;

import java.io.Serializable;
import java.util.UUID;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class BookmarkId implements Serializable {
    private UUID userId;
    private Long postId;
}
