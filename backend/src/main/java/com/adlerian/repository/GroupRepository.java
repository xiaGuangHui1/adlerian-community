package com.adlerian.repository;

import com.adlerian.entity.StudyGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<StudyGroup, Long> {
    Page<StudyGroup> findByCategory(String category, Pageable pageable);
    Page<StudyGroup> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
