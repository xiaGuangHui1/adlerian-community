package com.adlerian.repository;

import com.adlerian.entity.CircleComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CircleCommentRepository extends JpaRepository<CircleComment, Long> {
    List<CircleComment> findByPostIdAndParentIsNullOrderByCreatedAtAsc(Long postId);
    List<CircleComment> findByParentIdOrderByCreatedAtAsc(Long parentId);
    int countByPostId(Long postId);
}
