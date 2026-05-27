package com.adlerian.repository;

import com.adlerian.entity.Encouragement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface EncourageRepository extends JpaRepository<Encouragement, Long> {
    List<Encouragement> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(String targetType, Long targetId);
    List<Encouragement> findByReceiverIdOrderByCreatedAtDesc(UUID receiverId);
    int countByTargetTypeAndTargetId(String targetType, Long targetId);
}
