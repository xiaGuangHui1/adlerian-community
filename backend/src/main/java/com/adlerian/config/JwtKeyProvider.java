package com.adlerian.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.ECParameterSpec;
import java.security.spec.ECPoint;
import java.security.spec.ECPublicKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 从 Supabase JWKS 端点获取 ES256 公钥，用于验证 JWT token。
 * 支持定时刷新和按 kid 匹配密钥。
 */
@Slf4j
@Component
public class JwtKeyProvider {

    private final String jwksUrl;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, PublicKey> keyMap = new ConcurrentHashMap<>();

    public JwtKeyProvider(@Value("${supabase.url}") String supabaseUrl) {
        this.jwksUrl = supabaseUrl + "/auth/v1/.well-known/jwks.json";
    }

    @PostConstruct
    public void init() {
        refreshKeys();
    }

    /** 每小时刷新一次 JWKS，应对密钥轮换 */
    @Scheduled(fixedDelay = 3600000)
    public void refreshKeys() {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(jwksUrl))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Failed to fetch JWKS: HTTP {}", response.statusCode());
                return;
            }

            JsonNode jwks = objectMapper.readTree(response.body());
            JsonNode keys = jwks.get("keys");
            if (keys == null || !keys.isArray()) {
                log.error("JWKS response has no 'keys' array");
                return;
            }

            Map<String, PublicKey> newKeys = new ConcurrentHashMap<>();
            for (JsonNode keyNode : keys) {
                String kty = keyNode.has("kty") ? keyNode.get("kty").asText() : "";
                if (!"EC".equals(kty)) continue;

                String kid = keyNode.has("kid") ? keyNode.get("kid").asText() : "default";
                String xStr = keyNode.has("x") ? keyNode.get("x").asText() : null;
                String yStr = keyNode.has("y") ? keyNode.get("y").asText() : null;

                if (xStr == null || yStr == null) continue;

                byte[] xBytes = Base64.getUrlDecoder().decode(xStr);
                byte[] yBytes = Base64.getUrlDecoder().decode(yStr);

                KeyFactory keyFactory = KeyFactory.getInstance("EC");
                ECParameterSpec ecSpec = getP256Spec();
                ECPoint point = new ECPoint(new BigInteger(1, xBytes), new BigInteger(1, yBytes));
                ECPublicKeySpec keySpec = new ECPublicKeySpec(point, ecSpec);
                newKeys.put(kid, keyFactory.generatePublic(keySpec));
            }

            if (!newKeys.isEmpty()) {
                keyMap.clear();
                keyMap.putAll(newKeys);
                log.info("JWKS refreshed: loaded {} key(s)", newKeys.size());
            }
        } catch (Exception e) {
            log.error("Failed to refresh JWKS: {}", e.getMessage(), e);
        }
    }

    /** 根据 kid 获取对应公钥，不匹配则返回 null */
    public PublicKey getPublicKey(String kid) {
        if (kid != null && keyMap.containsKey(kid)) {
            return keyMap.get(kid);
        }
        // 只有一个 key 时兜底返回
        if (keyMap.size() == 1) {
            return keyMap.values().iterator().next();
        }
        return null;
    }

    /** P-256 / secp256r1 曲线参数 */
    private static ECParameterSpec getP256Spec() {
        BigInteger p = new BigInteger(
                "115792089210356248762697446949407573530086143415290314195533631308867097853951");
        BigInteger a = p.subtract(BigInteger.valueOf(3));
        return new ECParameterSpec(
                new java.security.spec.EllipticCurve(
                        new java.security.spec.ECFieldFp(p),
                        a,
                        new BigInteger("5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b", 16)
                ),
                new ECPoint(
                        new BigInteger("6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296", 16),
                        new BigInteger("4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5", 16)
                ),
                new BigInteger("115792089210356248762697446949407573529996955224135760342422259061068512044369"),
                1
        );
    }
}
