package com.adlerian.controller;

import com.adlerian.config.JwtKeyProvider;
import com.adlerian.dto.UpdateUserRequest;
import com.adlerian.entity.User;
import com.adlerian.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.PublicKey;
import java.util.Base64;
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
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = currentUserOrNull();
        if (user != null) {
            return ResponseEntity.ok(toProfileMap(user));
        }

        UUID authId = extractAuthId(authHeader);
        if (authId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "未登录"));
        }

        return userService.findByAuthId(authId)
                .<ResponseEntity<?>>map(existing -> ResponseEntity.ok(toProfileMap(existing)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "用户未注册")));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateUserRequest request) {
        User user = currentUserOrNull();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "未登录"));
        }
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
                "bio", user.getBio() != null ? user.getBio() : "",
                "createdAt", user.getCreatedAt().toString()
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
            String avatarUrl = extractAvatarUrl(authHeader);
            User user = userService.createUser(authId, nickname, avatarUrl);
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
        String token = authHeader.substring(7);
        try {
            String kid = extractKid(token);
            PublicKey key = keyProvider.getPublicKey(kid);
            if (key == null) return null;
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return UUID.fromString(claims.getSubject());
        } catch (Exception e) {
            log.warn("Failed to parse JWT: {}", e.getMessage());
            return null;
        }
    }

    /** 从 JWT 的 user_metadata 中提取头像 URL */
    private String extractAvatarUrl(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        try {
            String kid = extractKid(token);
            PublicKey key = keyProvider.getPublicKey(kid);
            if (key == null) return null;
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return extractAvatarFromClaims(claims);
        } catch (Exception e) {
            return null;
        }
    }

    private String extractAvatarFromClaims(Claims claims) {
        try {
            Object metadata = claims.get("user_metadata");
            if (metadata instanceof Map<?, ?> map) {
                Object avatar = map.get("avatar_url");
                if (avatar == null) avatar = map.get("picture");
                if (avatar instanceof String s && !s.isBlank()) return s;
            }
        } catch (Exception ignored) {}
        return null;
    }

    /** 从 JWT header 中提取 kid 字段 */
    private String extractKid(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]));
            int kidIdx = headerJson.indexOf("\"kid\"");
            if (kidIdx == -1) return null;
            int colonIdx = headerJson.indexOf(':', kidIdx);
            int startQuote = headerJson.indexOf('"', colonIdx);
            int endQuote = headerJson.indexOf('"', startQuote + 1);
            return headerJson.substring(startQuote + 1, endQuote);
        } catch (Exception e) {
            return null;
        }
    }

    private User currentUserOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            return null;
        }
        return user;
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
