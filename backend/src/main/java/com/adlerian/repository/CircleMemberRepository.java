package com.adlerian.repository;

import com.adlerian.entity.CircleMember;
import com.adlerian.entity.CircleMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CircleMemberRepository extends JpaRepository<CircleMember, CircleMemberId> {
    int countByCircleId(Long circleId);
    boolean existsByCircleIdAndUserId(Long circleId, UUID userId);
    List<CircleMember> findByUserId(UUID userId);
}
