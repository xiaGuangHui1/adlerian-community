package com.adlerian.controller;

import com.adlerian.dto.PostDTO;
import com.adlerian.dto.UpdateUserRequest;
import com.adlerian.entity.User;
import com.adlerian.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        User user = getCurrentAuthUser();
        return ResponseEntity.ok(toProfileMap(user));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateUserRequest request) {
        User user = getCurrentAuthUser();
        User updated = userService.updateUser(user.getId(), request);
        return ResponseEntity.ok(toProfileMap(updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable UUID id) {
        User user = userService.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "nickname", user.getNickname(),
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                "bio", user.getBio() != null ? user.getBio() : ""
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        User authUser = getCurrentAuthUser();
        // 检查是否已注册
        if (userService.findByAuthId(authUser.getAuthId()).isPresent()) {
            return ResponseEntity.ok(toProfileMap(authUser));
        }
        String nickname = body.getOrDefault("nickname", "社区成员");
        User user = userService.createUser(authUser.getAuthId(), nickname);
        return ResponseEntity.ok(toProfileMap(user));
    }

    private User getCurrentAuthUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Map<String, Object> toProfileMap(User user) {
        return Map.of(
                "id", user.getId(),
                "nickname", user.getNickname(),
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                "bio", user.getBio() != null ? user.getBio() : "",
                "createdAt", user.getCreatedAt().toString()
        );
    }
}
