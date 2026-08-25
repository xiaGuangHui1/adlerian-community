package com.adlerian.repository;

import com.adlerian.entity.CirclePost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CirclePostRepository extends JpaRepository<CirclePost, Long> {
    Page<CirclePost> findByCircleIdOrderByCreatedAtDesc(Long circleId, Pageable pageable);
    int countByCircleId(Long circleId);

    @Query("SELECT p.circle.id, COUNT(p) FROM CirclePost p GROUP BY p.circle.id")
    List<Object[]> countGroupByCircle();
}
