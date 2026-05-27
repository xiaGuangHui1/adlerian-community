package com.adlerian.service;

import com.adlerian.dto.PostDTO;
import com.adlerian.entity.Bookmark;
import com.adlerian.entity.BookmarkId;
import com.adlerian.entity.Post;
import com.adlerian.repository.BookmarkRepository;
import com.adlerian.repository.CommentRepository;
import com.adlerian.repository.EncourageRepository;
import com.adlerian.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final EncourageRepository encourageRepository;

    @Transactional
    public boolean toggleBookmark(UUID userId, Long postId) {
        BookmarkId id = new BookmarkId(userId, postId);
        if (bookmarkRepository.existsById(id)) {
            bookmarkRepository.deleteById(id);
            return false;
        } else {
            postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("帖子不存在"));
            Bookmark bookmark = Bookmark.builder()
                    .userId(userId)
                    .postId(postId)
                    .build();
            bookmarkRepository.save(bookmark);
            return true;
        }
    }

    public boolean isBookmarked(UUID userId, Long postId) {
        return bookmarkRepository.existsByUserIdAndPostId(userId, postId);
    }

    public Page<PostDTO> getUserBookmarks(UUID userId, Pageable pageable) {
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(bookmark -> {
                    Post post = postRepository.findById(bookmark.getPostId())
                            .orElseThrow(() -> new RuntimeException("帖子不存在"));
                    return PostDTO.builder()
                            .id(post.getId())
                            .title(post.getTitle())
                            .content(post.getContent())
                            .category(post.getCategory())
                            .pinned(post.isPinned())
                            .author(PostDTO.AuthorDTO.builder()
                                    .id(post.getAuthor().getId())
                                    .nickname(post.getAuthor().getNickname())
                                    .avatarUrl(post.getAuthor().getAvatarUrl())
                                    .build())
                            .createdAt(post.getCreatedAt())
                            .updatedAt(post.getUpdatedAt())
                            .encouragementCount(encourageRepository.countByTargetTypeAndTargetId("post", post.getId()))
                            .commentCount(commentRepository.countByPostId(post.getId()))
                            .build();
                });
    }
}
