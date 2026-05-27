package com.adlerian.repository;

import com.adlerian.entity.Bookmark;
import com.adlerian.entity.BookmarkId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BookmarkRepository extends JpaRepository<Bookmark, BookmarkId> {
    Page<Bookmark> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    boolean existsByUserIdAndPostId(UUID userId, Long postId);
}
