package com.adlerian.service;

import com.adlerian.dto.ActivityItemDTO;
import com.adlerian.dto.HomeStatsDTO;
import com.adlerian.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final EncourageRepository encourageRepository;
    private final DailyCheckInRepository checkInRepository;

    public HomeStatsDTO getStats() {
        return HomeStatsDTO.builder()
                .totalUsers(userRepository.count())
                .totalPosts(postRepository.count())
                .totalComments(commentRepository.count())
                .totalEncouragements(encourageRepository.count())
                .todayCheckIns(checkInRepository.countByCheckinDate(LocalDate.now()))
                .build();
    }

    public List<ActivityItemDTO> getActivity(int limit) {
        List<ActivityItemDTO> activities = new ArrayList<>();

        // 最近帖子
        postRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit)).forEach(post -> {
            activities.add(ActivityItemDTO.builder()
                    .type("post")
                    .description(post.getAuthor().getNickname() + " 发表了帖子")
                    .title(post.getTitle())
                    .targetId(post.getId())
                    .createdAt(post.getCreatedAt())
                    .build());
        });

        // 最近评论
        commentRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit)).forEach(comment -> {
            activities.add(ActivityItemDTO.builder()
                    .type("comment")
                    .description(comment.getAuthor().getNickname() + " 发表了评论")
                    .title(limitContent(comment.getContent(), 50))
                    .targetId(comment.getPost().getId())
                    .createdAt(comment.getCreatedAt())
                    .build());
        });

        // 按时间排序取前 N 条
        return activities.stream()
                .sorted(Comparator.comparing(ActivityItemDTO::getCreatedAt).reversed())
                .limit(limit)
                .toList();
    }

    private String limitContent(String content, int maxLen) {
        if (content.length() <= maxLen) return content;
        return content.substring(0, maxLen) + "...";
    }
}
