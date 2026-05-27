package com.adlerian.controller;

import com.adlerian.dto.PostDTO;
import com.adlerian.entity.User;
import com.adlerian.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @PostMapping("/{postId}")
    public ResponseEntity<Map<String, Boolean>> toggleBookmark(@PathVariable Long postId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean bookmarked = bookmarkService.toggleBookmark(user.getId(), postId);
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked));
    }

    @GetMapping
    public ResponseEntity<Page<PostDTO>> getMyBookmarks(Pageable pageable) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(bookmarkService.getUserBookmarks(user.getId(), pageable));
    }

    @GetMapping("/{postId}/status")
    public ResponseEntity<Map<String, Boolean>> getBookmarkStatus(@PathVariable Long postId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(Map.of("bookmarked", bookmarkService.isBookmarked(user.getId(), postId)));
    }
}
