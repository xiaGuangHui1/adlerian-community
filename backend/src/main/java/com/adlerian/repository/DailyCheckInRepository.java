package com.adlerian.repository;

import com.adlerian.entity.DailyCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DailyCheckInRepository extends JpaRepository<DailyCheckIn, Long> {

    Optional<DailyCheckIn> findByUserIdAndCheckinDate(UUID userId, LocalDate checkinDate);

    List<DailyCheckIn> findByUserIdAndCheckinDateBetweenOrderByCheckinDateAsc(
        UUID userId, LocalDate start, LocalDate end);

    long countByUserId(UUID userId);

    long countByCheckinDate(LocalDate checkinDate);

    List<DailyCheckIn> findByUserIdAndCheckinDateGreaterThanEqualOrderByCheckinDateDesc(
        UUID userId, LocalDate since);

    List<DailyCheckIn> findByUserIdInAndCheckinDateGreaterThanEqualOrderByCreatedAtDesc(
        List<UUID> userIds, LocalDate since);
}
