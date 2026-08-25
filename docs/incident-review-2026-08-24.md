# Adlerian Community 生产故障与账单复盘

> 日期：2026-08-24
> 触发问题：用户反馈「远端数据库好像挂了」，同时发现一笔 $14.22 的扣款。

## 一、概述

线上站点（`https://www.adlerian.com.cn`）数据接口无法访问。经排查，**根因不是 Supabase 数据库宕机，而是 Railway 后端服务已停止/构建失败**，叠加一个数据库环境变量拼写错误。此外，用户对一笔 $14.22 的 Supabase 扣款来源不明，经查证为**换套餐产生的一次性差额**，非持续扣费。

## 二、环境架构

```
用户浏览器 → Vercel（前端 React）→ Railway（后端 Spring Boot）→ Supabase PostgreSQL
```

| 组件 | 说明 |
|---|---|
| 前端 | Vercel，`vercel.json` 将 `/api/*` 反代到 Railway |
| 后端 | Railway，Spring Boot 3.3.5，Java 17/21，HikariCP 连接池 |
| 数据库 | Supabase PostgreSQL，地址 `db.yipozzrnnzgpywgxamjm.supabase.co:5432` |

关键标识：

- Railway 项目：`xiaguanghui`（id `46938674-5f50-4e98-9bb9-67617399bb7c`）
- Railway 服务：`adlerian`（id `a905af9e-ffc4-4c02-9494-531fb402e42d`）
- Railway 生产环境：id `122263b4-a3e4-4b94-a969-8b5259f9ae2d`
- Supabase 项目 ref：`yipozzrnnzgpywgxamjm`
- Supabase 组织 slug：`qmbgkjwguqngrsrmltmw`

## 三、排查过程与结论

1. **后端健康检查失败**：`https://adlerian-production.up.railway.app/api/health` 返回 `{"code":404,"message":"Application not found"}`。
2. **Railway 服务状态**：`adlerian` 服务 `status=FAILED`、`deploymentStopped=true`、运行副本 `0/1`。
3. **部署记录**：20 条部署中 19 条 `REMOVED`，1 条 `FAILED`（2026-06-03）。
4. **失败构建日志**：Java 编译错误（详见「根因 2」）。
5. **Supabase 本身**：REST 接口返回 `401 Unauthorized`（缺 apikey 的正常响应），而非「项目已暂停」，说明 Supabase 数据库侧未被暂停，问题集中在 Railway。
6. **本地代理干扰**：排查期间本机 DNS 被代理劫持为 `198.18.x.x`（Clash fake-IP），导致直连 Supabase 出现 `SSL_ERROR_SYSCALL`，属本机网络问题，非服务端故障。

## 四、根因分析

### 根因 1：Railway 后端服务已停止

服务没有任何运行中的副本（`replicas: 0/1`），最新部署状态为 `FAILED`，因此域名返回「Application not found」。这是「数据库挂了」的直接原因——前端所有 `/api/*` 请求到不了后端，也就到不了数据库。

### 根因 2：一次构建失败（编译错误），且修复后未重新部署

失败构建 `a8a7841b`（2026-06-03）的日志：

```
[ERROR] UserController.java:[93,40] method getPublicKey in class JwtKeyProvider
        cannot be applied to given types;
        required: java.lang.String
        found:    no arguments
```

- 原因：`JwtKeyProvider.getPublicKey()` 被改成需要 `String kid` 参数，但 `UserController` 调用处未同步更新。
- 现状：该编译错误在本地 `main` 分支已修复（两处调用点均已传 `kid`），但**从未重新部署到 Railway**。

### 根因 3：Railway 环境变量拼写错误（已修复）

生产变量中原为 `UPABASE_DB_USER`（缺少首字母 `S`），而 `application-prod.yml` 读取的是 `${SUPABASE_DB_USER}`。即使构建成功，Spring 启动时也会因无法解析该占位符而崩溃。

- 已修复：新增 `SUPABASE_DB_USER=postgres`，删除 `UPABASE_DB_USER`（2026-08-23）。

### 根因 4（账单）：Supabase $14.22 为一次性换套餐差额

- Supabase 发票 `PYUOEX-00004`（2026-06-04）金额 **$14.22**，为**换套餐产生的按比例计费**（推断为从付费套餐切回 Free 的差额，约 $25/月 × 17 天 ≈ $14.2）。
- 之后发票（6/18、7/18、8/18）均为 **$0.00**。
- 当前套餐为 **Free Plan**，且 **Spend cap（消费上限）已开启**，后续超出免费额度不会再扣费（最多项目变只读/不响应）。
- 待确认：下载 `PYUOEX-00004` 发票 PDF 可看到具体收费项目（如 `Pro plan（prorated）`）。

## 五、账单明细汇总

### Railway 用量（$）

| 月份 | 账单 | 明细 |
|---|---|---|
| 2026-05 | $0.00 | — |
| 2026-06 | $2.57 | 内存 $2.54、CPU $0.02 |
| 2026-07 | $1.95 | 内存 $1.93、CPU $0.02、出站流量 ≈0 |
| 2026-08 | $0.00 | 服务已停 |

> Railway 为 trial 额度用完后按用量计费，内存是大头；服务停止后不再产生费用。

### Supabase 发票（$）

| 日期 | 金额 | 发票号 |
|---|---|---|
| 2026-06-04 | **$14.22** | PYUOEX-00004 |
| 2026-06-18 及之后 | $0.00 | PYUOEX-00005 ~ 00008 |

## 六、已执行的修复

- [x] 修复 Railway 变量 typo：`UPABASE_DB_USER` → `SUPABASE_DB_USER=postgres`（`--skip-deploys`，未触发部署）。

## 七、遗留事项 / 待办

- [x] **重新部署 Railway 后端**：已完成（2026-08-24，deployment `ae4f7f33`，commit `25640d73`），`/api/health` 与 `/api/categories` 均返回 200。
- [x] 部署前本地验证：`cd backend && ./mvnw clean package -DskipTests` → BUILD SUCCESS。
- [ ] 下载并核对 Supabase 发票 `PYUOEX-00004` 的具体收费项目。
- [ ] 查看 Supabase 更早的 3 张发票（共 8 张，当前只显示 5 张），确认无其他金额。

## 八、经验教训

1. **「数据库挂了」≠ 数据库挂了**：先确认调用链上游（后端进程、反向代理）是否存活，再下结论。
2. **编译错误要跟到部署闭环**：代码修好但没重新部署，等于没修。
3. **环境变量名必须与配置读取严格一致**：一个字母的拼写错误（`UPABASE_DB_USER` vs `SUPABASE_DB_USER`）即可阻断整个启动流程；建议部署前做变量名校验。
4. **付费套餐切换要留意按比例账单**：切回免费版当月的差额账单容易被误认为「偷偷扣费」；切完后确认套餐与 Spend cap 状态。
5. **本地代理会干扰排查**：Clash 等工具的 fake-IP 会劫持 DNS 并导致 `SSL_ERROR_SYSCALL`，排查远端服务时先排除本地网络因素。
6. **新增表/字段必须同步到生产库**：生产库 `ddl-auto: none`（手动管理 schema），`database/init.sql` 是 schema 来源。任何新增表/字段的提交，都要把对应 DDL 在 Supabase SQL Editor 跑一遍，否则新功能上线后会出现「relation ... does not exist」。

## 九、行动项清单

| # | 行动 | 状态 |
|---|---|---|
| 1 | 修复 `SUPABASE_DB_USER` 变量 | ✅ 已完成 |
| 2 | 本地编译验证 `main` | ✅ 已完成（BUILD SUCCESS） |
| 3 | 重新部署 Railway 后端并验证 `/api/health` | ✅ 已完成（deployment `ae4f7f33`，200） |
| 4 | 核对 Supabase 发票明细与历史发票 | ⬜ 待办 |
| 5 | 确认是否恢复上线 | ✅ 已恢复上线（已付费，按量 ~$2/月） |

## 十、后续事件：社会兴趣页面加载失败（同日 2026-08-24）

上线后用户反馈「社会兴趣」页面未加载。`GET /api/circles` 返回 500：

```
relation "interest_circles" does not exist
```

### 根因

`f5bc886` 提交新增了「社会兴趣」功能，引入 4 张新表（`interest_circles` / `circle_members` / `circle_posts` / `circle_comments`）及索引，但 DDL 从未在 Supabase 生产库执行过——`database/init.sql` 已更新，但未在 Supabase SQL Editor 重跑。

### 修复

1. 直接连接 Supabase PostgreSQL，补建 4 张表 + 5 个索引（`CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`，幂等）。
2. 重启 Railway 后端，触发 `DataSeeder` 重新播种 22 个圈子及示例帖子。

### 验证

- `/api/circles` → HTTP 200，返回 22 个圈子，每个含示例帖子。
- 前端反代 `www.adlerian.com.cn/api/circles` → HTTP 200。
