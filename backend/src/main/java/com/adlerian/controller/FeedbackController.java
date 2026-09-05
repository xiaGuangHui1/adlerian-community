package com.adlerian.controller;

import com.adlerian.entity.User;
import com.adlerian.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(@RequestBody Map<String, String> body) {
        User user = currentUserOrNull();
        feedbackService.submit(user != null ? user.getId() : null, body.get("content"), body.get("contact"));
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private User currentUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user;
        }
        return null;
    }
}
