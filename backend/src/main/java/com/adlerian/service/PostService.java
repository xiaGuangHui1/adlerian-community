package com.adlerian.service;

import com.adlerian.dto.CreatePostRequest;
import com.adlerian.dto.PostDTO;
import com.adlerian.entity.Post;
import com.adlerian.entity.User;
import com.adlerian.repository.CommentRepository;
import com.adlerian.repository.EncourageRepository;
import com.adlerian.repository.PostRepository;
import com.adlerian.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final EncourageRepository encourageRepository;

    public Page<PostDTO> getPosts(String category, Pageable pageable) {
        Page<Post> posts;
        if (category != null && !category.isBlank()) {
            posts = postRepository.findByCategoryOrderByPinnedDescCreatedAtDesc(category, pageable);
        } else {
            posts = postRepository.findAllByOrderByPinnedDescCreatedAtDesc(pageable);
        }
        return mapPage(posts);
    }

    public PostDTO getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));
        return toDTO(post);
    }

    @Transactional
    public PostDTO createPost(UUID authorId, CreatePostRequest request) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        Post post = Post.builder()
                .author(author)
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .source(request.getSource())
                .build();
        return toDTO(postRepository.save(post), 0, 0);
    }

    @Transactional
    public PostDTO updatePost(Long id, UUID authorId, CreatePostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));
        if (!post.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("无权修改此帖子");
        }
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setCategory(request.getCategory());
        return toDTO(postRepository.save(post));
    }

    @Transactional
    public void deletePost(Long id, UUID authorId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));
        if (!post.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("无权删除此帖子");
        }
        postRepository.delete(post);
    }

    public Page<PostDTO> getUserPosts(UUID authorId, Pageable pageable) {
        return mapPage(postRepository.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable));
    }

    public List<PostDTO> getHotPosts(int limit) {
        Page<Post> page = postRepository.findHotPosts(PageRequest.of(0, Math.min(limit, 100)));
        return mapList(page.getContent());
    }

    @Transactional
    public PostDTO incrementViewCount(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
        return toDTO(post);
    }

    // ===== 批量计数，避免 N+1 查询 =====

    private Page<PostDTO> mapPage(Page<Post> posts) {
        List<Post> content = posts.getContent();
        Map<Long, Integer> encCounts = countEncouragements(content);
        Map<Long, Integer> commentCounts = countComments(content);
        return posts.map(p -> toDTO(p,
                encCounts.getOrDefault(p.getId(), 0),
                commentCounts.getOrDefault(p.getId(), 0)));
    }

    private List<PostDTO> mapList(List<Post> posts) {
        Map<Long, Integer> encCounts = countEncouragements(posts);
        Map<Long, Integer> commentCounts = countComments(posts);
        return posts.stream()
                .map(p -> toDTO(p,
                        encCounts.getOrDefault(p.getId(), 0),
                        commentCounts.getOrDefault(p.getId(), 0)))
                .toList();
    }

    private Map<Long, Integer> countEncouragements(List<Post> posts) {
        if (posts.isEmpty()) return Map.of();
        List<Long> ids = posts.stream().map(Post::getId).toList();
        return encourageRepository.countByTargetTypeAndTargetIdIn("post", ids).stream()
                .collect(Collectors.toMap(
                        r -> ((Number) r[0]).longValue(),
                        r -> ((Number) r[1]).intValue()));
    }

    private Map<Long, Integer> countComments(List<Post> posts) {
        if (posts.isEmpty()) return Map.of();
        List<Long> ids = posts.stream().map(Post::getId).toList();
        return commentRepository.countByPostIdIn(ids).stream()
                .collect(Collectors.toMap(
                        r -> ((Number) r[0]).longValue(),
                        r -> ((Number) r[1]).intValue()));
    }

    private PostDTO toDTO(Post post) {
        return toDTO(post,
                encourageRepository.countByTargetTypeAndTargetId("post", post.getId()),
                commentRepository.countByPostId(post.getId()));
    }

    private PostDTO toDTO(Post post, int encouragementCount, int commentCount) {
        return PostDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .category(post.getCategory())
                .source(post.getSource())
                .pinned(post.isPinned())
                .author(PostDTO.AuthorDTO.builder()
                        .id(post.getAuthor().getId())
                        .nickname(post.getAuthor().getNickname())
                        .avatarUrl(post.getAuthor().getAvatarUrl())
                        .build())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .encouragementCount(encouragementCount)
                .commentCount(commentCount)
                .viewCount(post.getViewCount())
                .build();
    }
}
