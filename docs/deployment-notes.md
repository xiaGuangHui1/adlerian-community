# Adlerian Community 部署笔记

## 应用信息

- **名称**: Adlerian Community（阿德勒心理学社群平台）
- **域名**: https://www.adlerian.com.cn
- **GitHub**: `git@github.com:xiaGuangHui1/adlerian-community.git`

## 架构

```
用户 → Vercel (React 前端) → Railway (Spring Boot 后端) → Supabase (PostgreSQL)
         ↑ 静态托管                    ↑ API 服务                  ↑ 数据库 + Auth
```

- **前端**: React 19 + Vite 8 + TypeScript + Tailwind CSS 4
- **后端**: Java 17 + Spring Boot 3.3.5 + Hibernate/JPA
- **数据库**: Supabase PostgreSQL (PgBouncer Pooler :6543)
- **认证**: Supabase Auth (JWT)

---

## 一、Supabase 数据库

### 1.1 创建项目

在 [supabase.com](https://supabase.com) 创建项目，获取以下信息：

- `SUPABASE_URL` — 项目 API URL
- `SUPABASE_ANON_KEY` — 匿名公钥（前端用）
- `SUPABASE_JWT_SECRET` — JWT 签名密钥（后端验证 token 用）
- 数据库连接信息（Settings → Database → Connection string）

### 1.2 初始化数据库

在 Supabase SQL Editor 执行 `/database/init.sql`，包含：
- `users`、`posts`、`comments`、`encouragements` 等基础表
- `daily_checkins`、`quotes`、`challenges`、`teams` 等功能表
- 索引和种子数据

### 1.3 配置 Auth

Supabase Dashboard → Authentication → URL Configuration：

```
Site URL: https://www.adlerian.com.cn
Redirect URLs: https://www.adlerian.com.cn
```

---

## 二、Railway 后端部署

### 2.1 项目配置

- 在 Railway 导入 GitHub 仓库
- Root Directory 设为 `backend`
- 构建和部署配置已通过 `railway.json` 管理

### 2.2 `railway.json`

```json
{
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "./mvnw clean package -DskipTests"
  },
  "deploy": {
    "startCommand": "java -jar target/*.jar",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2.3 `nixpacks.toml`

```toml
[providers]
id = "java"

[providers.java]
version = "17"

[system]
packages = ["unzip"]
```

### 2.4 `application-prod.yml` 关键配置

```yaml
server:
  port: ${PORT:8080}              # 读取 Railway 注入的端口

spring:
  datasource:
    # PgBouncer 事务模式：prepareThreshold=0 禁用 prepared statement 缓存
    url: jdbc:postgresql://${SUPABASE_DB_HOST}:${SUPABASE_DB_PORT:6543}/postgres?sslmode=require&prepareThreshold=0
    hikari:
      maximum-pool-size: 5        # PgBouncer 连接数有限
  jpa:
    hibernate:
      ddl-auto: none              # PgBouncer 不支持 DDL，schema 手动管理
```

### 2.5 Railway 环境变量

| 变量 | 值 | 来源 |
|------|-----|------|
| `SPRING_PROFILES_ACTIVE` | `prod` | 手动设置 |
| `PORT` | 自动注入 | Railway |
| `SUPABASE_DB_HOST` | `db.xxx.supabase.co` | Supabase |
| `SUPABASE_DB_PORT` | `6543` | Supabase Pooler |
| `SUPABASE_DB_USER` | 数据库用户 | Supabase |
| `SUPABASE_DB_PASSWORD` | 数据库密码 | Supabase |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase |
| `SUPABASE_ANON_KEY` | Supabase anon key | Supabase |
| `SUPABASE_JWT_SECRET` | JWT 签名密钥 | Supabase |
| `CORS_ORIGINS` | `https://www.adlerian.com.cn` | 手动设置 |

### 2.6 生成公网域名

Railway → 项目 Settings → Public Networking → Generate Domain，获得：

```
adlerian-production.up.railway.app
```

---

## 三、Vercel 前端部署

### 3.1 `vercel.json` — API 代理配置

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://adlerian-production.up.railway.app/api/:path*"
    },
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```

前端所有 `/api/*` 请求由 Vercel 代理转发到 Railway 后端，浏览器视为同源请求，无跨域问题。

### 3.2 Vercel 环境变量

在 Vercel Dashboard → Settings → Environment Variables 设置：

| 变量 | 值 | 用途 |
|------|-----|------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase 客户端初始化 |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Supabase 客户端初始化 |

注意：`VITE_` 前缀变量会被打包进前端代码，仅放公开信息。

### 3.3 部署命令

```bash
cd frontend
npx vercel --yes --prod
```

部署后获得默认域名 `frontend-ten-fawn-26.vercel.app`。

---

## 四、域名绑定

### 4.1 Vercel 添加域名

Vercel Dashboard → Settings → Domains → Add：
- `adlerian.com.cn`
- `www.adlerian.com.cn`

### 4.2 阿里云 DNS 配置

删除原有的 CDN CNAME 记录，改为 Vercel 要求的记录：

| 主机记录 | 类型 | 记录值 |
|----------|------|--------|
| `@` | A | `216.198.79.1` |
| `www` | CNAME | Vercel 分配的地址（如 `xxx.vercel-dns-017.com`） |

保留 `_acme-challenge` 和 `verification` TXT 记录不动。

### 4.3 等待生效

DNS 修改后等待几分钟，Vercel 会自动验证并签发 SSL 证书。

---

## 五、验证清单

```bash
# 后端 healthcheck
curl https://adlerian-production.up.railway.app/api/health
# → {"status":"ok"}

# 前端页面
curl -o /dev/null -w "%{http_code}" https://www.adlerian.com.cn
# → 200

# API 代理
curl https://www.adlerian.com.cn/api/health
# → {"status":"ok"}
```

- [x] 后端部署成功
- [x] 前端部署成功
- [x] API 代理联通
- [x] 自定义域名生效
- [x] SSL 证书正常

---

## 六、常见问题

### PgBouncer / Supabase Pooler 注意事项

1. **`ddl-auto` 必须为 `none`** — PgBouncer 事务模式不支持 DDL 操作
2. **`prepareThreshold=0`** — 禁用 JDBC prepared statement 缓存
3. **连接池大小 ≤5** — PgBouncer 连接数有限
4. **端口使用 6543** — Pooler 端口，非直连 5432
5. **Schema 变更手动执行** — 通过 Supabase SQL Editor 操作

### 代码更新流程

```bash
git add -A
git commit -m "描述改动"
git push origin main
# Railway 自动重新部署
# Vercel 自动重新部署（如关联了 GitHub）
```
