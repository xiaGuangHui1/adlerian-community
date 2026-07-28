package com.adlerian.entity;

import java.io.Serializable;
import java.util.UUID;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class CircleMemberId implements Serializable {
    private Long circleId;
    private UUID userId;
}
