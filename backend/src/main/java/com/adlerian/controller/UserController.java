package com.adlerian.controller;

import com.adlerian.config.JwtKeyProvider;
import com.adlerian.dto.UpdateUserRequest;
import com.adlerian.entity.User;
import com.adlerian.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.PublicKey;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final JwtKeyProvider keyProvider;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            User user = getCurrentAuthUser();
            return ResponseEntity.ok(toProfileMap(user));
        } catch (Exception e) {
            log.info("User not found in local DB, profile not created yet");
            return ResponseEntity.status(404).body(Map.of("error", "用户未注册"));
        }
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
    public ResponseEntity<?> register(@RequestBody Map<String, String> body,
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("Register request received, auth header present: {}", authHeader != null);
            // 直接解析 JWT 获取 authId，不依赖 SecurityContext（新用户还未存入本地数据库）
            UUID authId = extractAuthId(authHeader);
            log.info("Extracted authId: {}", authId);
            if (authId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "未登录"));
            }

            // 检查是否已注册
            if (userService.findByAuthId(authId).isPresent()) {
                User existing = userService.findByAuthId(authId).get();
                return ResponseEntity.ok(toProfileMap(existing));
            }

            String nickname = body.getOrDefault("nickname", "社区成员");
            User user = userService.createUser(authId, nickname);
            return ResponseEntity.ok(toProfileMap(user));
        } catch (Exception e) {
            log.error("Failed to register user: {} ({})", e.getMessage(), e.getClass().getSimpleName(), e);
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "注册失败: " + msg,
                    "type", e.getClass().getSimpleName()
            ));
        }
    }

    /** 从 Authorization header 解析 JWT 中的 sub（Supabase 用户 ID） */
    private UUID extractAuthId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            PublicKey key = keyProvider.getPublicKey();
            if (key == null) return null;
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(authHeader.substring(7))
                    .getPayload();
            return UUID.fromString(claims.getSubject());
        } catch (Exception e) {
            log.warn("Failed to parse JWT: {}", e.getMessage());
            return null;
        }
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
