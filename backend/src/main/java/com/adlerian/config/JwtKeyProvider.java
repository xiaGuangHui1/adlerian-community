package com.adlerian.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

/**
 * 从 Supabase JWKS 端点获取 ES256 公钥，用于验证 JWT token。
 * Supabase 已迁移到 ES256 非对称签名，旧的 HMAC 密钥无法验证新 token。
 */
@Slf4j
@Component
public class JwtKeyProvider {

    private final String jwksUrl;

    private PublicKey publicKey;

    public JwtKeyProvider(@Value("${supabase.url}") String supabaseUrl) {
        this.jwksUrl = supabaseUrl + "/auth/v1/.well-known/jwks.json";
    }

    @PostConstruct
    public void init() {
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

            String json = response.body();
            log.info("Fetched JWKS from Supabase successfully");

            // 解析 JWKS JSON 中的 x, y 坐标（ES256 EC P-256 公钥）
            String xStr = extractJsonValue(json, "\"x\"");
            String yStr = extractJsonValue(json, "\"y\"");

            if (xStr == null || yStr == null) {
                log.error("Could not find x/y coordinates in JWKS response");
                return;
            }

            // Base64url 解码坐标
            byte[] xBytes = Base64.getUrlDecoder().decode(xStr);
            byte[] yBytes = Base64.getUrlDecoder().decode(yStr);

            BigInteger x = new BigInteger(1, xBytes);
            BigInteger y = new BigInteger(1, yBytes);

            // 创建 EC P-256 公钥
            KeyFactory keyFactory = KeyFactory.getInstance("EC");
            ECParameterSpec ecSpec = ECNamedCurveTable.getParameterSpec("P-256");
            ECPoint point = new ECPoint(x, y);
            ECPublicKeySpec keySpec = new ECPublicKeySpec(point, ecSpec);
            this.publicKey = keyFactory.generatePublic(keySpec);

            log.info("JWKS public key loaded successfully");
        } catch (Exception e) {
            log.error("Failed to load JWKS public key: {}", e.getMessage(), e);
        }
    }

    public PublicKey getPublicKey() {
        return publicKey;
    }

    /** 简单的 JSON 字段提取（避免引入额外依赖） */
    private static String extractJsonValue(String json, String key) {
        int keyIdx = json.indexOf(key);
        if (keyIdx == -1) return null;
        int colonIdx = json.indexOf(':', keyIdx);
        if (colonIdx == -1) return null;
        int startQuote = json.indexOf('"', colonIdx);
        if (startQuote == -1) return null;
        int endQuote = json.indexOf('"', startQuote + 1);
        if (endQuote == -1) return null;
        return json.substring(startQuote + 1, endQuote);
    }

    /** 内部辅助类：EC 命名曲线查找 */
    private static class ECNamedCurveTable {
        static ECParameterSpec getParameterSpec(String name) throws Exception {
            if ("P-256".equals(name) || "secp256r1".equals(name)) {
                // P-256 / secp256r1 参数
                BigInteger p = new BigInteger(
                        "115792089210356248762697446949407573530086143415290314195533631308867097853951");
                // Java EllipticCurve 不接受负系数，a = -3 需转为 p - 3
                BigInteger a = p.subtract(BigInteger.valueOf(3));
                return new ECParameterSpec(
                        new java.security.spec.EllipticCurve(
                                new java.security.spec.ECFieldFp(p),
                                a,
                                new BigInteger(
                                        "5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b", 16)
                        ),
                        new ECPoint(
                                new BigInteger("6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296", 16),
                                new BigInteger("4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5", 16)
                        ),
                        new BigInteger("115792089210356248762697446949407573529996955224135760342422259061068512044369"),
                        1
                );
            }
            throw new IllegalArgumentException("Unsupported curve: " + name);
        }
    }
}
