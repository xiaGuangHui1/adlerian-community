package com.adlerian.repository;

import com.adlerian.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByUserAAndUserB(UUID userA, UUID userB);

    @Query("SELECT c FROM Conversation c WHERE c.userA = :userId OR c.userB = :userId ORDER BY c.lastMessageAt DESC")
    List<Conversation> findByUserId(@Param("userId") UUID userId);
}
