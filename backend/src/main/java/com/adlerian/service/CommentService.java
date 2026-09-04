package com.adlerian.service;

import com.adlerian.dto.CommentDTO;
import com.adlerian.dto.CreateCommentRequest;
import com.adlerian.dto.PostDTO;
import com.adlerian.entity.Comment;
import com.adlerian.entity.Post;
import com.adlerian.entity.User;
import com.adlerian.repository.CommentRepository;
import com.adlerian.repository.EncourageRepository;
import com.adlerian.repository.PostRepository;
import com.adlerian.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final EncourageRepository encourageRepository;
    private final NotificationService notificationService;

    public Page<CommentDTO> getCommentsByPostId(Long postId, Pageable pageable) {
        Page<Comment> topLevel = commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtAsc(postId, pageable);
        return topLevel.map(this::toDTOWithReplies);
    }

    @Transactional
    public CommentDTO createComment(Long postId, UUID authorId, CreateCommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Comment comment = Comment.builder()
                .post(post)
                .author(author)
                .content(request.getContent())
                .tag(request.getTag())
                .build();

        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("父评论不存在"));
            comment.setParent(parent);
        }

        Comment saved = commentRepository.save(comment);

        // 通知帖子作者
        if (!post.getAuthor().getId().equals(authorId)) {
            notificationService.notify(post.getAuthor().getId(), "comment", author,
                    "post", post.getId(), preview(request.getContent()));
        }
        // 通知父评论作者（回复）
        if (comment.getParent() != null) {
            User parentAuthor = comment.getParent().getAuthor();
            if (!parentAuthor.getId().equals(authorId)
                    && !parentAuthor.getId().equals(post.getAuthor().getId())) {
                notificationService.notify(parentAuthor.getId(), "reply", author,
                        "post", post.getId(), preview(request.getContent()));
            }
        }

        return toDTO(saved);
    }

    private String preview(String content) {
        if (content == null) return "";
        return content.length() > 50 ? content.substring(0, 50) + "..." : content;
    }

    @Transactional
    public void deleteComment(Long id, UUID authorId) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("评论不存在"));
        if (!comment.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("无权删除此评论");
        }
        commentRepository.delete(comment);
    }

    private CommentDTO toDTOWithReplies(Comment comment) {
        CommentDTO dto = toDTO(comment);
        List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId());
        dto.setReplies(replies.stream().map(this::toDTOWithReplies).toList());
        return dto;
    }

    private CommentDTO toDTO(Comment comment) {
        return CommentDTO.builder()
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
                .encouragementCount(encourageRepository.countByTargetTypeAndTargetId("comment", comment.getId()))
                .tag(comment.getTag())
                .build();
    }
}
