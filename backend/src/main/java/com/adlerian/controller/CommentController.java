package com.adlerian.controller;

import com.adlerian.dto.CommentDTO;
import com.adlerian.dto.CreateCommentRequest;
import com.adlerian.entity.User;
import com.adlerian.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
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
