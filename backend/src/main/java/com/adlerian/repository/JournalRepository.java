package com.adlerian.repository;

import com.adlerian.entity.Journal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface JournalRepository extends JpaRepository<Journal, Long> {
    Page<Journal> findByAuthorIdOrderByCreatedAtDesc(UUID authorId, Pageable pageable);
    Page<Journal> findByIsPublicTrueOrderByCreatedAtDesc(Pageable pageable);
}
