package com.adlerian.controller;

import com.adlerian.dto.*;
import com.adlerian.entity.User;
import com.adlerian.service.InterestCircleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/circles")
@RequiredArgsConstructor
public class InterestCircleController {

    private final InterestCircleService circleService;

    @GetMapping
    public ResponseEntity<List<InterestCircleDTO>> getAllCircles() {
        User user = null;
        try {
            user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        } catch (Exception ignored) {}
        return ResponseEntity.ok(circleService.getAllCircles(
                user != null ? user.getId() : null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterestCircleDTO> getCircleDetail(@PathVariable Long id) {
        User user = null;
        try {
            user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        } catch (Exception ignored) {}
        return ResponseEntity.ok(circleService.getCircleDetail(id,
                user != null ? user.getId() : null));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinCircle(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        circleService.joinCircle(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveCircle(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        circleService.leaveCircle(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<Page<CirclePostDTO>> getCirclePosts(
            @PathVariable Long id,
            Pageable pageable) {
        return ResponseEntity.ok(circleService.getCirclePosts(id, pageable));
    }

    @GetMapping("/{circleId}/posts/{postId}")
    public ResponseEntity<CirclePostDTO> getPostDetail(
            @PathVariable Long circleId,
            @PathVariable Long postId) {
        return ResponseEntity.ok(circleService.getPostDetail(postId));
    }

    @PostMapping("/{id}/posts")
    public ResponseEntity<CirclePostDTO> createPost(
            @PathVariable Long id,
            @Valid @RequestBody CreateCirclePostRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(circleService.createPost(id, user.getId(), request));
    }

    @GetMapping("/{circleId}/posts/{postId}/comments")
    public ResponseEntity<List<CircleCommentDTO>> getPostComments(
            @PathVariable Long circleId,
            @PathVariable Long postId) {
        return ResponseEntity.ok(circleService.getPostComments(postId));
    }

    @PostMapping("/{circleId}/posts/{postId}/comments")
    public ResponseEntity<CircleCommentDTO> addComment(
            @PathVariable Long circleId,
            @PathVariable Long postId,
            @Valid @RequestBody CreateCircleCommentRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(circleService.addComment(postId, user.getId(), request));
    }
}
