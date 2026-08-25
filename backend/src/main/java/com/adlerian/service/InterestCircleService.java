package com.adlerian.service;

import com.adlerian.dto.*;
import com.adlerian.entity.*;
import com.adlerian.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterestCircleService {

    private final InterestCircleRepository circleRepository;
    private final CircleMemberRepository memberRepository;
    private final CirclePostRepository postRepository;
    private final CircleCommentRepository commentRepository;
    private final UserRepository userRepository;

    public List<InterestCircleDTO> getAllCircles(UUID userId) {
        List<InterestCircle> circles = circleRepository.findAllByOrderBySortOrderAsc();
        if (circles.isEmpty()) {
            return List.of();
        }

        Map<Long, Integer> memberCounts = memberRepository.countGroupByCircle().stream()
                .collect(Collectors.toMap(
                        r -> ((Number) r[0]).longValue(),
                        r -> ((Number) r[1]).intValue()));
        Map<Long, Integer> postCounts = postRepository.countGroupByCircle().stream()
                .collect(Collectors.toMap(
                        r -> ((Number) r[0]).longValue(),
                        r -> ((Number) r[1]).intValue()));
        Set<Long> joinedCircleIds = userId == null
                ? Set.of()
                : new HashSet<>(memberRepository.findCircleIdsByUserId(userId));

        return circles.stream()
                .map(c -> toCircleDTO(c, userId, memberCounts, postCounts, joinedCircleIds))
                .collect(Collectors.toList());
    }

    public InterestCircleDTO getCircleDetail(Long circleId, UUID userId) {
        InterestCircle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new RuntimeException("圈子不存在"));
        return toCircleDTO(circle, userId);
    }

    @Transactional
    public void joinCircle(Long circleId, UUID userId) {
        if (!circleRepository.existsById(circleId)) {
            throw new RuntimeException("圈子不存在");
        }
        if (memberRepository.existsByCircleIdAndUserId(circleId, userId)) {
            throw new RuntimeException("已经加入该圈子");
        }
        CircleMember member = CircleMember.builder()
                .circleId(circleId)
                .userId(userId)
                .build();
        memberRepository.save(member);
    }

    @Transactional
    public void leaveCircle(Long circleId, UUID userId) {
        if (!memberRepository.existsByCircleIdAndUserId(circleId, userId)) {
            throw new RuntimeException("尚未加入该圈子");
        }
        memberRepository.deleteById(new CircleMemberId(circleId, userId));
    }

    public Page<CirclePostDTO> getCirclePosts(Long circleId, Pageable pageable) {
        return postRepository.findByCircleIdOrderByCreatedAtDesc(circleId, pageable)
                .map(this::toPostDTO);
    }

    public CirclePostDTO getPostDetail(Long postId) {
        CirclePost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
        return toPostDTO(post);
    }

    @Transactional
    public CirclePostDTO createPost(Long circleId, UUID authorId, CreateCirclePostRequest request) {
        InterestCircle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new RuntimeException("圈子不存在"));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 发帖自动加入圈子
        if (!memberRepository.existsByCircleIdAndUserId(circleId, authorId)) {
            CircleMember member = CircleMember.builder()
                    .circleId(circleId)
                    .userId(authorId)
                    .build();
            memberRepository.save(member);
        }

        CirclePost post = CirclePost.builder()
                .circle(circle)
                .author(author)
                .title(request.getTitle())
                .content(request.getContent())
                .build();
        return toPostDTO(postRepository.save(post));
    }

    public List<CircleCommentDTO> getPostComments(Long postId) {
        List<CircleComment> topLevel = commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtAsc(postId);
        return topLevel.stream().map(this::toCommentDTOWithReplies).collect(Collectors.toList());
    }

    @Transactional
    public CircleCommentDTO addComment(Long postId, UUID authorId, CreateCircleCommentRequest request) {
        CirclePost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        CircleComment comment = CircleComment.builder()
                .post(post)
                .author(author)
                .content(request.getContent())
                .build();

        if (request.getParentId() != null) {
            CircleComment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("父评论不存在"));
            comment.setParent(parent);
        }

        return toCommentDTO(commentRepository.save(comment));
    }

    private InterestCircleDTO toCircleDTO(InterestCircle circle, UUID userId) {
        return InterestCircleDTO.builder()
                .id(circle.getId())
                .name(circle.getName())
                .description(circle.getDescription())
                .icon(circle.getIcon())
                .coverUrl(circle.getCoverUrl())
                .sortOrder(circle.getSortOrder())
                .memberCount(memberRepository.countByCircleId(circle.getId()))
                .postCount(postRepository.countByCircleId(circle.getId()))
                .createdAt(circle.getCreatedAt())
                .joined(userId != null && memberRepository.existsByCircleIdAndUserId(circle.getId(), userId))
                .build();
    }

    private InterestCircleDTO toCircleDTO(InterestCircle circle, UUID userId,
                                          Map<Long, Integer> memberCounts,
                                          Map<Long, Integer> postCounts,
                                          Set<Long> joinedCircleIds) {
        return InterestCircleDTO.builder()
                .id(circle.getId())
                .name(circle.getName())
                .description(circle.getDescription())
                .icon(circle.getIcon())
                .coverUrl(circle.getCoverUrl())
                .sortOrder(circle.getSortOrder())
                .memberCount(memberCounts.getOrDefault(circle.getId(), 0))
                .postCount(postCounts.getOrDefault(circle.getId(), 0))
                .createdAt(circle.getCreatedAt())
                .joined(userId != null && joinedCircleIds.contains(circle.getId()))
                .build();
    }

    private CirclePostDTO toPostDTO(CirclePost post) {
        return CirclePostDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .author(PostDTO.AuthorDTO.builder()
                        .id(post.getAuthor().getId())
                        .nickname(post.getAuthor().getNickname())
                        .avatarUrl(post.getAuthor().getAvatarUrl())
                        .build())
                .viewCount(post.getViewCount())
                .commentCount(commentRepository.countByPostId(post.getId()))
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private CircleCommentDTO toCommentDTO(CircleComment comment) {
        return CircleCommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(PostDTO.AuthorDTO.builder()
                        .id(comment.getAuthor().getId())
                        .nickname(comment.getAuthor().getNickname())
                        .avatarUrl(comment.getAuthor().getAvatarUrl())
                        .build())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .createdAt(comment.getCreatedAt())
                .replies(new ArrayList<>())
                .build();
    }

    private CircleCommentDTO toCommentDTOWithReplies(CircleComment comment) {
        CircleCommentDTO dto = toCommentDTO(comment);
        List<CircleComment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId());
        dto.setReplies(replies.stream().map(this::toCommentDTOWithReplies).collect(Collectors.toList()));
        return dto;
    }
}
