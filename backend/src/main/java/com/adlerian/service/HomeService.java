package com.adlerian.service;

import com.adlerian.dto.ActivityItemDTO;
import com.adlerian.dto.HomeStatsDTO;
import com.adlerian.repository.*;
import jakarta.persistence.EntityManager;
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

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final EntityManager entityManager;

    public HomeStatsDTO getStats() {
        Object[] row = (Object[]) entityManager.createNativeQuery(
                "SELECT " +
                        "(SELECT COUNT(*) FROM users), " +
                        "(SELECT COUNT(*) FROM posts), " +
                        "(SELECT COUNT(*) FROM comments), " +
                        "(SELECT COUNT(*) FROM encouragements), " +
                        "(SELECT COUNT(*) FROM daily_checkins WHERE checkin_date = :today)"
        ).setParameter("today", LocalDate.now()).getSingleResult();

        return HomeStatsDTO.builder()
                .totalUsers(((Number) row[0]).longValue())
                .totalPosts(((Number) row[1]).longValue())
                .totalComments(((Number) row[2]).longValue())
                .totalEncouragements(((Number) row[3]).longValue())
                .todayCheckIns(((Number) row[4]).longValue())
                .build();
    }

    public List<ActivityItemDTO> getActivity(int limit) {
        // 限制最大加载量，防止内存溢出
        int safeLimit = Math.min(limit, 50);
        List<ActivityItemDTO> activities = new ArrayList<>();

        // 最近帖子
        postRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, safeLimit)).forEach(post -> {
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
