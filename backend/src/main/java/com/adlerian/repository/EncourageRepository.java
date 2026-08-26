package com.adlerian.repository;

import com.adlerian.entity.Encouragement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface EncourageRepository extends JpaRepository<Encouragement, Long> {
    List<Encouragement> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(String targetType, Long targetId);
    List<Encouragement> findByReceiverIdOrderByCreatedAtDesc(UUID receiverId);
    int countByTargetTypeAndTargetId(String targetType, Long targetId);

    @Query("SELECT e.targetId, COUNT(e) FROM Encouragement e WHERE e.targetType = :targetType AND e.targetId IN :targetIds GROUP BY e.targetId")
    List<Object[]> countByTargetTypeAndTargetIdIn(@Param("targetType") String targetType, @Param("targetIds") List<Long> targetIds);
}
