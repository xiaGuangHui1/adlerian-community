package com.adlerian.repository;

import com.adlerian.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdAndParentIsNullOrderByCreatedAtAsc(Long postId);
    Page<Comment> findByPostIdAndParentIsNullOrderByCreatedAtAsc(Long postId, Pageable pageable);
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);
    int countByPostId(Long postId);
    Page<Comment> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
