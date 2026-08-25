package com.adlerian.repository;

import com.adlerian.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByCategory(String category, Pageable pageable);
    Page<Post> findByAuthorId(UUID authorId, Pageable pageable);
    Page<Post> findAllByOrderByPinnedDescCreatedAtDesc(Pageable pageable);
    Page<Post> findByCategoryOrderByPinnedDescCreatedAtDesc(String category, Pageable pageable);
    @EntityGraph(attributePaths = "author")
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query(value = "SELECT p.* FROM posts p ORDER BY (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) DESC, p.created_at DESC", nativeQuery = true)
    Page<Post> findHotPosts(Pageable pageable);
}
