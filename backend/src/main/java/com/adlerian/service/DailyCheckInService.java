package com.adlerian.service;

import com.adlerian.dto.CheckInDTO;
import com.adlerian.dto.CheckInFeedDTO;
import com.adlerian.dto.CreateCheckInRequest;
import com.adlerian.dto.CreatePostRequest;
import com.adlerian.dto.PostDTO;
import com.adlerian.entity.DailyCheckIn;
import com.adlerian.entity.User;
import com.adlerian.repository.DailyCheckInRepository;
import com.adlerian.repository.EncourageRepository;
import com.adlerian.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
    private final EncourageRepository encourageRepository;
    private final PostService postService;

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
        checkIn = checkInRepository.save(checkIn);

        if (request.isSyncToForum()) {
            syncToForum(checkIn, user, request);
        }

        return toDTO(checkIn);
    }

    private void syncToForum(DailyCheckIn checkIn, User user, CreateCheckInRequest request) {
        String title = request.getForumTitle();
        if (title == null || title.isBlank()) {
            title = "我的实践分享 · " + LocalDate.now().format(DateTimeFormatter.ofPattern("M月d日"));
        }
        String category = request.getForumCategory();
        if (category == null || category.isBlank()) {
            category = "life-courage";
        }
        CreatePostRequest postRequest = new CreatePostRequest(title, request.getContent(), category, "checkin");

        if (checkIn.getPostId() == null) {
            PostDTO post = postService.createPost(user.getId(), postRequest);
            checkIn.setPostId(post.getId());
            checkInRepository.save(checkIn);
        } else {
            postService.updatePost(checkIn.getPostId(), user.getId(), postRequest);
        }
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

    public List<CheckInFeedDTO> getFeed(int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        List<DailyCheckIn> checkIns = checkInRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, safeLimit))
                .getContent();
        if (checkIns.isEmpty()) {
            return List.of();
        }

        List<Long> ids = checkIns.stream().map(DailyCheckIn::getId).toList();
        Map<Long, Integer> counts = encourageRepository
                .countByTargetTypeAndTargetIdIn("checkin", ids).stream()
                .collect(Collectors.toMap(
                        r -> ((Number) r[0]).longValue(),
                        r -> ((Number) r[1]).intValue()));

        return checkIns.stream()
                .map(c -> toFeedDTO(c, counts.getOrDefault(c.getId(), 0)))
                .toList();
    }

    private CheckInFeedDTO toFeedDTO(DailyCheckIn checkIn, int encouragementCount) {
        User author = checkIn.getUser();
        return CheckInFeedDTO.builder()
                .id(checkIn.getId())
                .checkinDate(checkIn.getCheckinDate())
                .content(checkIn.getContent())
                .createdAt(checkIn.getCreatedAt())
                .author(PostDTO.AuthorDTO.builder()
                        .id(author.getId())
                        .nickname(author.getNickname())
                        .avatarUrl(author.getAvatarUrl())
                        .build())
                .encouragementCount(encouragementCount)
                .build();
    }

    private CheckInDTO toDTO(DailyCheckIn checkIn) {
        return CheckInDTO.builder()
                .id(checkIn.getId())
                .checkinDate(checkIn.getCheckinDate())
                .content(checkIn.getContent())
                .postId(checkIn.getPostId())
                .createdAt(checkIn.getCreatedAt())
                .updatedAt(checkIn.getUpdatedAt())
                .build();
    }
}
