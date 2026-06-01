# 阿德勒心理学社区 — 项目初始化指南

本文档记录项目的完整配置步骤，及配置过程中遇到的常见问题。

---

## 一、前端配置

### 1. 环境变量

创建 `frontend/.env`：

```
VITE_SUPABASE_URL=https://yipozzrnnzgpywgxamjm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxx
```

### 2. Supabase 客户端（`frontend/src/lib/supabase.ts`）

必须添加 auth 配置，否则 OTP 验证码登录会异常：

```ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,  // OTP 流程必须开启
  },
});
```

### 3. 启动

```bash
cd frontend
npm install
npm run dev
```

访问 `http://localhost:5173`

---

## 二、后端配置

### 配置文件

- **开发环境**: `backend/src/main/resources/application.yml`
- **生产环境**: `backend/src/main/resources/application-prod.yml`

关键配置项：

| 配置项 | 说明 |
|---|---|
| `server.port` | 默认 8080，生产环境通过 `${PORT:8080}` 读取 Railway 环境变量 |
| `supabase.jwt-secret` | Supabase 项目的 JWT Secret，用于验证前端传过来的 token |
| `app.cors.allowed-origins` | 开发环境设为 `http://localhost:5173` |

### JDK 安装（macOS）

项目需要 **Java 17**。

```bash
# 安装
brew install openjdk@17

# 创建系统链接（需要 sudo 密码）
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# 写入环境变量（永久生效）
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

如果 `sudo` 不可用，每次启动前手动 export：

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
```

### 启动

```bash
cd backend
./mvnw spring-boot:run
```

API 地址: `http://localhost:8080`

---

## 三、Supabase 配置（最重要）

### 1. 开启 Email 认证

**路径**: Authentication → Sign In / Providers → Email

- 开启 Email 登录
- **OTP Length** 设为 `6`（默认是 8，和前端 6 位输入框不匹配）

### 2. 配置 SMTP 邮件服务

Supabase 自带邮件服务每小时只能发 2 封，**必须配置自定义 SMTP**。

**路径**: Authentication → Email → SMTP Settings

以网易 163 邮箱为例：

| 字段 | 值 |
|---|---|
| Sender email address | `your-email@163.com` |
| Sender name | `阿德勒心理学社区` |
| Host | `smtp.163.com` |
| Port number | `465`（不要用 587，从海外连 163 的 587 不稳定） |
| Username | `your-email@163.com` |
| Password | **授权码**（不是邮箱登录密码！） |
| Minimum interval per user | `60` |

### 3. 获取 163 邮箱授权码

1. 登录 [mail.163.com](https://mail.163.com)
2. 设置 → POP3/SMTP/IMAP → 开启 SMTP 服务
3. 会显示一个授权码，复制到 Supabase SMTP 的 Password 字段

### 4. 修改邮件模板（发送验证码而非链接）

Supabase 默认发送**魔法链接**，需要手动改为**数字验证码**。

**路径**: Authentication → Email → Templates

需要修改两个模板：**Magic link** 和 **Confirm sign up**。

替换为以下模板：

```html
<h2>阿德勒心理学社区</h2>
<p>您的验证码是：</p>
<h1 style="font-size: 32px; letter-spacing: 6px; color: #e87b35;">
  {{ .Token }}
</h1>
<p>请在登录页面输入以上 6 位验证码，1 小时内有效。</p>
<hr>
<p style="color: #999; font-size: 12px;">
  如果无法输入验证码，也可以点击此链接直接登录：
  <a href="{{ .ConfirmationURL }}">登录</a>
</p>
```

关键：`{{ .Token }}` = 6 位数字验证码，`{{ .ConfirmationURL }}` = 魔法链接（作为备选）。

---

## 四、常见问题排查

| 现象 | 原因 | 解决 |
|---|---|---|
| 发送验证码返回 **504 Gateway Timeout** | SMTP 未配置，或自带邮件服务超限 | 配置自定义 SMTP |
| 收到的是**链接**而不是 6 位验证码 | 邮件模板没改，默认发魔法链接 | 按第三节第 4 步修改模板 |
| 发送成功但**验证码过期/无效** | 安全软件（如 Outlook Safe Links）预加载了链接，消耗了 token | 模板中用 `{{ .Token }}` 代替 `{{ .ConfirmationURL }}` |
| **频率限制**错误 | 同一邮箱 60 秒内重复请求 | 等待 60 秒后重试 |
| API 返回 **502 Bad Gateway** | 后端未启动 | `cd backend && ./mvnw spring-boot:run` |
| 登录后跳转到注册页 | 后端 `/users/me` 返回 404，说明用户 Profile 不存在 | 正常流程，新用户需要设置昵称 |
| 163 邮箱死活发不了 | 海外 IP 连接 163 SMTP 不稳定 | 换 Resend（免费 100 封/天）: smtp.resend.com:465 |
| 设置昵称报 **502 Bad Gateway** | 后端没启动 / JDK 没装 | 检查 `lsof -i :8080`，没输出则装 JDK 17 并启动后端 |
| 后端启动报 **Unable to locate a Java Runtime** | 没装 JDK 或 JAVA_HOME 未设置 | `brew install openjdk@17` 并设置 JAVA_HOME |

### 调试方法

前端登录页面：`http://localhost:5173/login`

打开浏览器控制台（**F12**），点击发送验证码后查看 `[sendOTP] error:` 和 Network 面板：

1. **504 GATEWAY_TIMEOUT** → SMTP 没配好或邮件服务不可用
2. **429 RATE_LIMIT** → 请求太频繁，等 60 秒
3. **401 UNAUTHORIZED** → Supabase anon key 配错了

---

## 五、技术栈速览

| 层 | 技术 | 备注 |
|---|---|---|
| 前端 | React + TypeScript + Vite + Tailwind CSS | 端口 5173 |
| 后端 | Spring Boot + JPA + H2/PostgreSQL | 端口 8080 |
| 认证 | Supabase Auth | JWT token 由 Supabase 签发 |
| 邮件 | Supabase → 163 SMTP | 必须在 Dashboard 配置 |
| 前端认证库 | `@supabase/supabase-js` v2.106 | `signInWithOtp({ email })` 发送验证码 |
