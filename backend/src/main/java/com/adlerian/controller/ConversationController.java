package com.adlerian.controller;

import com.adlerian.dto.ConversationDTO;
import com.adlerian.dto.MessageDTO;
import com.adlerian.entity.User;
import com.adlerian.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping
    public ResponseEntity<List<ConversationDTO>> listConversations() {
        User user = currentUser();
        return ResponseEntity.ok(conversationService.getConversations(user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        User user = currentUser();
        return ResponseEntity.ok(Map.of("count", conversationService.getUnreadCount(user.getId())));
    }

    @PostMapping
    public ResponseEntity<ConversationDTO> openConversation(@RequestBody Map<String, String> body) {
        User user = currentUser();
        UUID otherUserId = UUID.fromString(body.get("userId"));
        return ResponseEntity.ok(conversationService.getOrCreateConversation(user.getId(), otherUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationDTO> getConversation(@PathVariable Long id) {
        User user = currentUser();
        return ResponseEntity.ok(conversationService.getConversation(id, user.getId()));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageDTO>> getMessages(@PathVariable Long id) {
        User user = currentUser();
        return ResponseEntity.ok(conversationService.getMessages(id, user.getId()));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageDTO> sendMessage(@PathVariable Long id,
                                                  @RequestBody Map<String, String> body) {
        User user = currentUser();
        return ResponseEntity.ok(conversationService.sendMessage(id, user.getId(), body.get("content")));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        User user = currentUser();
        conversationService.markRead(id, user.getId());
        return ResponseEntity.ok().build();
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
