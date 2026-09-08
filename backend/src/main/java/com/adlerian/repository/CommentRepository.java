package com.adlerian.repository;

import com.adlerian.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdAndParentIsNullOrderByCreatedAtAsc(Long postId);
    Page<Comment> findByPostIdAndParentIsNullOrderByCreatedAtAsc(Long postId, Pageable pageable);
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);
    int countByPostId(Long postId);

    @Query("SELECT c.post.id, COUNT(c) FROM Comment c WHERE c.post.id IN :postIds GROUP BY c.post.id")
    List<Object[]> countByPostIdIn(@Param("postIds") List<Long> postIds);

    @EntityGraph(attributePaths = {"author", "post"})
    Page<Comment> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
