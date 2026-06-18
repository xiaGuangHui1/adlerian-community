package com.adlerian.repository;

import com.adlerian.entity.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByTypeOrderBySortOrderAsc(String type);
    Page<Resource> findByTypeOrderBySortOrderAsc(String type, Pageable pageable);
    Page<Resource> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
