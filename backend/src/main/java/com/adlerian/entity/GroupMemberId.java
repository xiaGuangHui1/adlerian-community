package com.adlerian.entity;

import java.io.Serializable;
import java.util.UUID;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class GroupMemberId implements Serializable {
    private Long groupId;
    private UUID userId;
}
