package com.adlerian.repository;

import com.adlerian.entity.CircleMember;
import com.adlerian.entity.CircleMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface CircleMemberRepository extends JpaRepository<CircleMember, CircleMemberId> {
    int countByCircleId(Long circleId);
    boolean existsByCircleIdAndUserId(Long circleId, UUID userId);
    List<CircleMember> findByUserId(UUID userId);

    @Query("SELECT m.circleId, COUNT(m) FROM CircleMember m GROUP BY m.circleId")
    List<Object[]> countGroupByCircle();

    @Query("SELECT m.circleId FROM CircleMember m WHERE m.userId = :userId")
    List<Long> findCircleIdsByUserId(@Param("userId") UUID userId);
}
