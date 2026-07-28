package com.adlerian.repository;

import com.adlerian.entity.InterestCircle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterestCircleRepository extends JpaRepository<InterestCircle, Long> {
    List<InterestCircle> findAllByOrderBySortOrderAsc();
}
