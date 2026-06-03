package com.adlerian.controller;

import com.adlerian.dto.CreatePostRequest;
import com.adlerian.dto.PostDTO;
import com.adlerian.entity.User;
import com.adlerian.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<Page<PostDTO>> getPosts(
            @RequestParam(required = false) String category,
            Pageable pageable) {
        return ResponseEntity.ok(postService.getPosts(category, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(postService.incrementViewCount(id));
    }

    @PostMapping
    public ResponseEntity<PostDTO> createPost(@Valid @RequestBody CreatePostRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(postService.createPost(user.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> updatePost(@PathVariable Long id,
                                               @Valid @RequestBody CreatePostRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(postService.updatePost(id, user.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        postService.deletePost(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/hot")
    public ResponseEntity<List<PostDTO>> getHotPosts(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(postService.getHotPosts(limit));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PostDTO>> getUserPosts(@PathVariable UUID userId, Pageable pageable) {
        return ResponseEntity.ok(postService.getUserPosts(userId, pageable));
    }
}
