package com.adlerian.config;

import com.adlerian.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwsHeader;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Base64;
import java.util.Collections;
import java.util.UUID;

/**
 * 从请求的 Authorization header 中提取 Supabase JWT，
 * 使用 JWKS 公钥验证，并将用户信息设置到 SecurityContext。
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final JwtKeyProvider keyProvider;

    public JwtAuthenticationFilter(UserRepository userRepository, JwtKeyProvider keyProvider) {
        this.userRepository = userRepository;
        this.keyProvider = keyProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                // 从 JWT header 中提取 kid（不验证签名）
                String kid = extractKid(token);
                var key = keyProvider.getPublicKey(kid);
                if (key == null) {
                    log.warn("No matching public key for kid={}", kid);
                } else {
                    Claims claims = Jwts.parser()
                            .verifyWith(key)
                            .build()
                            .parseSignedClaims(token)
                            .getPayload();

                    String sub = claims.getSubject();
                    UUID authId = UUID.fromString(sub);

                    userRepository.findByAuthId(authId).ifPresent(user -> {
                        var auth = new UsernamePasswordAuthenticationToken(
                                user, null, Collections.emptyList());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    });
                }
            } catch (Exception e) {
                log.debug("JWT verification failed: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    /** 从未验证的 JWT header 中提取 kid 字段 */
    private String extractKid(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]));
            // 简单提取 kid，避免额外解析
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
}
