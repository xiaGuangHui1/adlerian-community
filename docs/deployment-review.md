# Adlerian Community 后端 Railway 部署复盘

## 概述

将 Spring Boot 3.3.5 后端通过 Railway 部署，连接 Supabase PostgreSQL 数据库（通过 PgBouncer Pooler 端口 6543）。部署过程中多次失败于 Healthcheck 阶段，经排查最终成功部署。

## 环境架构

```
用户浏览器 → Vercel（前端 React）→ Railway（后端 Spring Boot）→ Supabase PostgreSQL（PgBouncer:6543）
```

- **后端**: Java 17, Spring Boot 3.3.5, Hibernate/JPA
- **数据库**: Supabase PostgreSQL, 通过 PgBouncer 连接池访问
- **构建**: Railway Railpack + Nixpacks (Java 17)
- **部署配置**: `railway.json`, `nixpacks.toml`

## 历次部署尝试与修复

### 第 1 轮：初始部署 `e366ded` → `37d6757`

初始配置 Railway，基础配置完成。

### 第 2 轮：Railway 构建配置 `7ddbbf1` → `51fdb4a`

- 添加 `nixpacks.toml` 配置 Java 17 和 unzip 依赖
- 修复 `railway.json` builder 从 NIXPACKS 改为 RAILPACK

### 第 3 轮：Supabase 连接配置 `560169a` → `05bea42`

- 使用 Supabase pooler 端口 6543（不是直连的 5432）
- 添加 SSL require 模式
- `prepareThreshold=0` 适配 PgBouncer（Pgbouncer 事务模式不支持 prepared statements）
- HikariCP 连接池大小降为 5（Pgbouncer 连接数有限）
- `server.port: ${PORT:8080}` 适配 Railway 端口注入
- `healthcheckTimeout` 增加到 300 秒

**结果**: 仍然失败，Healthcheck 超时。

### 第 4 轮：核心修复（本次 `097b9ea` → `5d48e70`）

#### 问题定位

Railway 部署时间线：
```
Initialization  →  05:33 ✅
Build           →  00:18 ✅
Deploy          →  00:17 ✅
Network         →  00:22 ✅
Healthcheck     →  04:51 ❌ 超时失败
```

Network 抓包关键证据：
```
srcAddr: 54.255.219.82:6543  (Supabase)
dstAddr: 10.186.217.133:33116 (Railway 实例)
dropCause: "NO_SOCKET"
```

`NO_SOCKET` 表示目标端口没有进程监听——说明应用启动后崩溃退出了。

#### 根因分析

1. **主因：`ddl-auto: update` 与 PgBouncer 冲突**

   Hibernate 在启动时执行 Schema 验证/创建（DDL），但 Supabase Pooler (PgBouncer) 运行在 Transaction Mode，对 DDL 操作支持有限。这导致 Hibernate 的 `SessionFactory` 初始化失败，**应用在启动阶段就崩溃了**，还没监听端口。随后 healthcheck 探测到 `NO_SOCKET`，持续超时直到失败。

2. **次因：`application.yml` 端口硬编码**

   默认 profile 中 `server.port: 8080` 没有读取 Railway 注入的 `PORT` 环境变量。虽然 `application-prod.yml` 中有 `${PORT:8080}`，但如果 `SPRING_PROFILES_ACTIVE=prod` 未正确设置，应用就监听在错误端口。

#### 最终修复

| 文件 | 改动 | 目的 |
|------|------|------|
| `application-prod.yml` | `ddl-auto: update` → `none` | 绕过 PgBouncer DDL 限制 |
| `application.yml` | `port: 8080` → `port: ${PORT:8080}` | 所有 profile 统一读取 Railway PORT |
| `HealthController.java` | 新建 `/api/health` 端点 | 轻量健康检查，不依赖数据库 |
| `SecurityConfig.java` | 放行 `/api/health` | healthcheck 无需鉴权 |
| `railway.json` | `healthcheckPath: /api/health` | 改用轻量端点 |

#### 修复后结果

```
Initialization  →  02:25 ✅
Build           →  02:25 ✅
Deploy          →  00:17 ✅
Post-deploy     →  00:00 ✅
Network         →  00:11 ✅
```

部署成功，Healthcheck 秒过。

## 最终生产配置

### `application-prod.yml`
```yaml
server:
  port: ${PORT:8080}

spring:
  datasource:
    url: jdbc:postgresql://${SUPABASE_DB_HOST}:${SUPABASE_DB_PORT:6543}/postgres?sslmode=require&prepareThreshold=0
    hikari:
      connection-timeout: 30000
      maximum-pool-size: 5
  jpa:
    hibernate:
      ddl-auto: none          # 关键：避免 PgBouncer DDL 冲突
```

### `railway.json`
```json
{
  "deploy": {
    "startCommand": "java -jar target/*.jar",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Railway 环境变量清单

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `SPRING_PROFILES_ACTIVE` | 激活生产配置 | `prod` |
| `PORT` | Railway 自动注入 | 由平台设置 |
| `SUPABASE_DB_HOST` | Supabase 数据库主机 | `db.xxx.supabase.co` |
| `SUPABASE_DB_PORT` | Pooler 端口 | `6543` |
| `SUPABASE_DB_USER` | 数据库用户 | `postgres.xxx` |
| `SUPABASE_DB_PASSWORD` | 数据库密码 | (从 Supabase 获取) |
| `SUPABASE_URL` | Supabase API URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase 匿名密钥 | (从 Supabase 获取) |
| `SUPABASE_JWT_SECRET` | JWT 签名密钥 | (从 Supabase 获取) |
| `CORS_ORIGINS` | 允许的跨域来源 | `https://www.adlerian.com.cn` |

## 关键经验

1. **PgBouncer Transaction Mode 不支持 DDL 操作**。使用 PgBouncer 时 `ddl-auto` 必须设为 `none`，Schema 变更通过 Supabase SQL Editor 手动执行。
2. **`prepareThreshold=0`** 对 PgBouncer 兼容至关重要，禁用 JDBC 的 prepared statement 缓存。
3. **健康检查端点不应依赖外部服务**。`/api/health` 直接返回 200，不查数据库，确保后端健康检查轻量可靠。
4. **所有 profile 统一读取 `PORT` 环境变量**，避免 profile 切换导致端口不一致。
5. **`NO_SOCKET` 网络错误**指向应用崩溃而非端口配置问题，排查时应优先查看应用启动日志。
