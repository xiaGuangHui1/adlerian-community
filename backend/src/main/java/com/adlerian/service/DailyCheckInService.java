package com.adlerian.service;

import com.adlerian.dto.CheckInDTO;
import com.adlerian.dto.CreateCheckInRequest;
import com.adlerian.entity.DailyCheckIn;
import com.adlerian.entity.User;
import com.adlerian.repository.DailyCheckInRepository;
import com.adlerian.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DailyCheckInService {

    private final DailyCheckInRepository checkInRepository;
    private final UserRepository userRepository;

    public Optional<CheckInDTO> getTodayCheckIn(UUID userId) {
        return checkInRepository.findByUserIdAndCheckinDate(userId, LocalDate.now())
                .map(this::toDTO);
    }

    public List<CheckInDTO> getMonthlyCheckIns(UUID userId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return checkInRepository
                .findByUserIdAndCheckinDateBetweenOrderByCheckinDateAsc(userId, start, end)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public CheckInDTO createOrUpdateTodayCheckIn(UUID userId, CreateCheckInRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        LocalDate today = LocalDate.now();

        DailyCheckIn checkIn = checkInRepository.findByUserIdAndCheckinDate(userId, today)
                .orElse(DailyCheckIn.builder()
                        .user(user)
                        .checkinDate(today)
                        .build());

        checkIn.setContent(request.getContent());

        return toDTO(checkInRepository.save(checkIn));
    }

    public long getTotalCheckInDays(UUID userId) {
        return checkInRepository.countByUserId(userId);
    }

    public int getCurrentStreak(UUID userId) {
        LocalDate since = LocalDate.now().minusDays(365);
        List<DailyCheckIn> recent = checkInRepository
                .findByUserIdAndCheckinDateGreaterThanEqualOrderByCheckinDateDesc(userId, since);
        if (recent.isEmpty()) return 0;

        int streak = 0;
        LocalDate expected = LocalDate.now();
        // 如果今天还没打卡，从昨天开始算
        if (recent.get(0).getCheckinDate().isBefore(expected)) {
            expected = expected.minusDays(1);
        }
        for (DailyCheckIn c : recent) {
            if (c.getCheckinDate().equals(expected)) {
                streak++;
                expected = expected.minusDays(1);
            } else if (c.getCheckinDate().isBefore(expected)) {
                break;
            }
        }
        return streak;
    }

    public List<CheckInDTO> getUserCheckIns(UUID userId) {
        LocalDate since = LocalDate.now().minusDays(365);
        return checkInRepository
                .findByUserIdAndCheckinDateGreaterThanEqualOrderByCheckinDateDesc(userId, since)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Map<String, Object> getUserStats(UUID userId) {
        long totalDays = getTotalCheckInDays(userId);
        int streak = getCurrentStreak(userId);
        return java.util.Map.of("totalDays", totalDays, "streak", streak);
    }

    private CheckInDTO toDTO(DailyCheckIn checkIn) {
        return CheckInDTO.builder()
                .id(checkIn.getId())
                .checkinDate(checkIn.getCheckinDate())
                .content(checkIn.getContent())
                .createdAt(checkIn.getCreatedAt())
                .updatedAt(checkIn.getUpdatedAt())
                .build();
    }
}
