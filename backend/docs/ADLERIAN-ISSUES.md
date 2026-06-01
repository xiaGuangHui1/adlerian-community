# Adlerian 社区项目问题复盘

## 1. 登录验证码无法发送（504 超时）

**现象**：前端登录页发送验证码时返回 504 Gateway Timeout。

**根因**：Supabase 项目 `yipozzrnnzgpywgxamjm` 虽然启用了邮箱认证，但未配置自定义 SMTP，导致 Supabase 内置邮件服务不可用。

**解决**：
- 在 Supabase Dashboard → Authentication → Email 中配置 163.com SMTP
  - SMTP Host: `smtp.163.com`
  - Port: `465`
  - 使用网易邮箱授权码（非登录密码）
- 进入 Authentication → Email Templates，将 `{{ .ConfirmationURL }}` 替换为 `{{ .Token }}`，让邮件发送数字验证码而非 Magic Link

---

## 2. 注册时 500 ClassCastException

**现象**：新用户验证码登录后设置昵称时，后端返回 `500 Internal Server Error`：
```
java.lang.ClassCastException: class java.lang.String cannot be cast to class com.adlerian.entity.User
```

**根因**：新用户通过 Supabase 认证后拥有合法 JWT，但其 `authId` 尚未在本地 H2 数据库 `users` 表中注册。JWT 过滤器（`JwtAuthenticationFilter`）在数据库中查不到用户 → 不设置 `SecurityContext` 认证信息。`/api/users/register` 虽然配置为 `permitAll()`，但请求通过时 SecurityContext 中的 principal 是 `"anonymousUser"` 字符串。`getCurrentAuthUser()` 强制转换为 `User` 导致 ClassCastException。

**解决**：修改 `UserController.register()` 方法，不依赖 SecurityContext，直接从请求的 `Authorization` header 解析 JWT 的 `sub` 字段获取 `authId`。

```java
// 修改后：直接解析 JWT，绕过 SecurityContext
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody Map<String, String> body,
                                   @RequestHeader("Authorization") String authHeader) {
    UUID authId = extractAuthId(authHeader);
    // ...
}
```

---

## 3. JWT 验证 401 Unauthorized（根因：ES256 签名迁移）

**现象**：修复 ClassCastException 后，注册仍然返回 401。

**第一层原因**：Supabase JWT Secret 是 Base64 编码的，代码直接使用 `jwtSecret.getBytes()` 而非解码后的字节。

**修复**：添加 `Base64.getDecoder().decode(jwtSecret)`。

**第二层原因（根本）**：修复 Base64 解码后仍然 401。后端日志：
```
The parsed JWT indicates it was signed with the 'ES256' signature algorithm,
but the provided javax.crypto.spec.SecretKeySpec key may not be used to verify ES256 signatures.
```

**根因**：Supabase 已将 JWT 签名从 HMAC（对称，HS256）升级为 ES256（非对称，椭圆曲线 P-256）。旧的 JWT Secret 无法验证新 token。需要从 Supabase JWKS 端点获取 EC P-256 公钥。

**解决**：创建 `JwtKeyProvider` 组件，从 Supabase JWKS 端点 `{supabase_url}/auth/v1/.well-known/jwks.json` 获取公钥。

---

## 4. 编译错误：verifyWith(Key) 类型不匹配

**现象**：
```
对于 verifyWith(java.security.Key), 找不到合适的方法
- verifyWith(javax.crypto.SecretKey) 不适用 (参数不匹配)
- verifyWith(java.security.PublicKey) 不适用 (参数不匹配)
```

**根因**：jjwt 库的 `verifyWith()` 方法只接受 `SecretKey` 或 `PublicKey`，不接受泛化类型 `java.security.Key`。`JwtKeyProvider.getPublicKey()` 返回的是 `Key` 类型。

**解决**：将 `JwtKeyProvider.publicKey` 字段和 `getPublicKey()` 返回类型从 `Key` 改为 `PublicKey`，同时在 `JwtAuthenticationFilter` 和 `UserController` 中使用 `PublicKey` 类型。

涉及文件：
- `JwtKeyProvider.java`：`Key` → `PublicKey`
- `UserController.java`：`import java.security.Key` → `import java.security.PublicKey`

---

## 5. 启动错误：EC 曲线负系数

**现象**：
```
Fetched JWKS from Supabase successfully
Failed to load JWKS public key: first coefficient is negative
```

**根因**：P-256 椭圆曲线的方程参数 `a = -3`。Java 的 `java.security.spec.EllipticCurve` 构造函数不接受负系数。

**解决**：将 `a = -3` 改为 `a = p - 3`（模素数 p），数学上等价：
```java
BigInteger p = new BigInteger("115792089210356248762697446949407573530086143415290314195533631308867097853951");
BigInteger a = p.subtract(BigInteger.valueOf(3));  // 等同于 -3 mod p
```

---

## 6. JWKS 端点连接失败

**现象**：
```
java.nio.channels.UnresolvedAddressException
```

**根因**：`application.yml` 中 `SUPABASE_URL` 默认值为占位符 `https://your-project.supabase.co`，DNS 无法解析。

**解决**：更新默认值为真实 Supabase 项目地址：
```yaml
supabase:
  url: ${SUPABASE_URL:https://yipozzrnnzgpywgxamjm.supabase.co}
```

---

## 后端启动命令

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## 前端启动命令

```bash
cd frontend && npm run dev
```
