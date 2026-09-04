package com.adlerian.controller;

import com.adlerian.dto.NotificationDTO;
import com.adlerian.entity.User;
import com.adlerian.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getNotifications(Pageable pageable) {
        User user = currentUser();
        return ResponseEntity.ok(notificationService.getNotifications(user.getId(), pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        User user = currentUser();
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user.getId())));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        User user = currentUser();
        return ResponseEntity.ok(notificationService.markAsRead(id, user.getId()));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        User user = currentUser();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
