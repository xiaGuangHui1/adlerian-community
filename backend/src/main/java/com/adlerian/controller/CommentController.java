package com.adlerian.controller;

import com.adlerian.dto.CommentDTO;
import com.adlerian.dto.CreateCommentRequest;
import com.adlerian.entity.User;
import com.adlerian.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<Page<CommentDTO>> getComments(@PathVariable Long postId, Pageable pageable) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId, pageable));
    }

    @PostMapping
    public ResponseEntity<CommentDTO> createComment(@PathVariable Long postId,
                                                     @Valid @RequestBody CreateCommentRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(commentService.createComment(postId, user.getId(), request));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long postId,
                                               @PathVariable Long commentId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        commentService.deleteComment(commentId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
