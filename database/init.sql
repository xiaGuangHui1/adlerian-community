-- =============================================
-- 阿德勒心理学社群 - 数据库初始化脚本
-- 用于 Supabase PostgreSQL
-- =============================================

-- 用户表（与Supabase Auth关联）
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 帖子表
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 评论表（支持多级嵌套）
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 鼓励表（替代点赞 —— 阿德勒心理学核心设计）
CREATE TABLE IF NOT EXISTS encouragements (
    id BIGSERIAL PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
    target_id BIGINT,
    message TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 成长日记表
CREATE TABLE IF NOT EXISTS journals (
    id BIGSERIAL PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200),
    content TEXT NOT NULL,
    template_type VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 互助小组表
CREATE TABLE IF NOT EXISTS study_groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES users(id),
    max_members INT DEFAULT 20,
    category VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 小组成员表
CREATE TABLE IF NOT EXISTS group_members (
    group_id BIGINT NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- 收藏表（私密，不公开数量）
CREATE TABLE IF NOT EXISTS bookmarks (
    user_id UUID NOT NULL REFERENCES users(id),
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

-- 学习资源表
CREATE TABLE IF NOT EXISTS resources (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('book', 'article', 'concept', 'path')),
    content TEXT,
    cover_url TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 每日签到表
CREATE TABLE IF NOT EXISTS daily_checkins (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    checkin_date DATE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, checkin_date)
);

-- 名言警句表
CREATE TABLE IF NOT EXISTS quotes (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author VARCHAR(100),
    source VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 挑战表
CREATE TABLE IF NOT EXISTS challenges (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    target_count INT,
    icon VARCHAR(20),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 挑战参与表
CREATE TABLE IF NOT EXISTS challenge_enrollments (
    id BIGSERIAL PRIMARY KEY,
    challenge_id BIGINT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    progress INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (challenge_id, user_id)
);

-- 团队表
CREATE TABLE IF NOT EXISTS teams (
    id BIGSERIAL PRIMARY KEY,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    creator_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(50) NOT NULL,
    check_in_time VARCHAR(5) DEFAULT '20:00',
    max_members INT DEFAULT 3,
    status VARCHAR(10) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ
);

-- 团队成员表
CREATE TABLE IF NOT EXISTS team_members (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (team_id, user_id)
);

-- =============================================
-- 索引
-- =============================================
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_encouragements_target ON encouragements(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_encouragements_receiver ON encouragements(receiver_id);
CREATE INDEX IF NOT EXISTS idx_journals_author ON journals(author_id);
CREATE INDEX IF NOT EXISTS idx_journals_public ON journals(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_challenge_enrollments_user ON challenge_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_enrollments_challenge ON challenge_enrollments(challenge_id);
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON teams(invite_code);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- =============================================
-- 初始学习资源数据（阿德勒心理学核心概念）
-- =============================================
INSERT INTO resources (title, description, type, content, sort_order) VALUES
('自卑感与优越感', '阿德勒心理学的基石概念', 'concept',
'## 自卑感与优越感

每个人都有自卑感，这是人类进步的动力。自卑感本身不是问题，问题在于我们如何面对它。

### 健康的自卑感
- 承认自己的不完美
- 将自卑感转化为成长的动力
- "我现在还不够好，但我可以通过努力变得更好"

### 自卑情结
- 以自卑为借口逃避生活课题
- "因为我不够好，所以我做不到"
- 这是一种逃避，不是事实

### 优越情结
- 通过虚假的优越感来掩饰自卑
- 炫耀、贬低他人、沉迷过去的荣耀
- 本质上仍然是对自卑感的逃避', 1),

('课题分离', '区分自己的课题和他人的课题', 'concept',
'## 课题分离

阿德勒心理学最实用的概念之一。核心问题是：**这件事最终的后果由谁来承担？**

### 如何判断这是谁的课题？
问自己："这件事的结果，最终由谁来承受？"
- 如果答案是对方 → 那是对方的课题
- 如果答案是自己 → 那是自己的课题

### 实践原则
- **不干涉他人的课题**：即使出于好意
- **不让他人干涉自己的课题**：勇敢地划定界限
- **在能控制的事情上努力**：把注意力放在自己的课题上

### 常见误区
- 课题分离 ≠ 冷漠无情
- 课题分离 ≠ 不关心他人
- 课题分离是尊重彼此的独立性', 2),

('共同体感觉', '对社会的归属感和贡献感', 'concept',
'## 共同体感觉（Gemeinschaftsgefühl）

阿德勒认为，幸福的关键在于**共同体感觉**——感觉自己属于一个共同体，并愿意为之贡献。

### 三个要素
1. **自我接纳**：不是自我肯定，而是接受不完美的自己
2. **他者信赖**：无条件地信任他人（这需要勇气）
3. **他者贡献**：为他人和社会做出贡献

### 贡献感
- 幸福来自"我对他人有用"的感觉
- 不需要他人的认可（那是他人的课题）
- 贡献本身就是回报

### 如何培养共同体感觉？
- 扩大自己的共同体范围
- 在日常生活中寻找贡献的机会
- 用"我们"的视角看问题', 3),

('生活风格', '每个人独特的思维和行为模式', 'concept',
'## 生活风格（Life Style）

阿德勒用"生活风格"来描述一个人在幼年时期形成的、对自己和世界的根本看法。

### 什么是生活风格？
- 大约在4-5岁时形成
- 包含对自我、他人、世界的基本认知
- 影响我们所有的思维、情感和行为
- **但它是可以改变的**

### 生活风格的组成
- **自我概念**：我是什么样的人
- **世界观**：世界是什么样的
- **自我理想**：我应该成为什么样的人
- **道德信念**：什么是对的，什么是错的

### 改变生活风格
阿德勒认为，虽然生活风格在幼年形成，但人有**自我决定的能力**。
我们可以选择重新审视和改变自己的生活风格。', 4),

('目的论', '行为是由目的驱动的，而非原因', 'concept',
'## 目的论 vs 原因论

阿德勒心理学的一个重要立场：**人的行为是由目的驱动的，而不是由过去的原因决定的。**

### 原因论（阿德勒反对的）
- "因为小时候被欺负，所以我害怕社交"
- "因为父母离异，所以我无法信任他人"
- 将现在的问题归咎于过去

### 目的论（阿德勒主张的）
- "我选择害怕社交，是因为这样可以避免被拒绝"
- "我选择不信任他人，是因为这样可以保护自己"
- **行为背后总有一个目的**

### 目的论的意义
- 不是否认过去的影响
- 而是强调我们有**选择的自由**
- 既然是自己选择的，就可以做出**新的选择**
- 把注意力从"为什么"转向"为了什么"', 5),

('横向关系', '所有人际关系都是平等的', 'concept',
'## 横向关系 vs 纵向关系

阿德勒主张所有的人际关系都应该是**横向**的，而不是纵向的。

### 纵向关系（阿德勒反对的）
- 有上下之分、优劣之别
- 表扬和批评都是纵向关系的产物
- "你做得真好！"（暗含"我有资格评判你"）
- 操控和被操控

### 横向关系（阿德勒主张的）
- 人与人之间是平等的
- 用**鼓励**替代表扬
- "谢谢你的帮助"（平等的感谢）
- "我看到了你的努力"（关注过程）

### 鼓励 vs 表扬
| 表扬 | 鼓励 |
|------|------|
| 纵向关系 | 横向关系 |
| 评判结果 | 关注过程 |
| "你真棒" | "你一直在努力" |
| 制造依赖 | 培养勇气 |', 6),

('《被讨厌的勇气》', '岸见一郎 / 古贺史健 | 阿德勒心理学入门必读', 'book',
'以对话体的形式，深入浅出地介绍阿德勒心理学的核心思想。通过一位青年与哲学家的对话，探讨自由、幸福、人际关系等根本问题。被誉为"改变人生的哲学课"。

**推荐理由**：最适合入门的阿德勒心理学读物，语言通俗，思想深刻。', 1),

('《自卑与超越》', '阿尔弗雷德·阿德勒 | 阿德勒的代表作', 'book',
'阿德勒亲自撰写的经典著作，系统阐述了个体心理学的核心理论。涵盖自卑感、社会兴趣、生活风格、生活任务等核心概念。

**推荐理由**：了解阿德勒心理学的源头，适合有一定基础后深入阅读。', 2),

('《幸福的勇气》', '岸见一郎 / 古贺史健 | 《被讨厌的勇气》续作', 'book',
'继《被讨厌的勇气》之后，青年再次来到哲学家的书房。这次对话聚焦于"如何在现实中实践阿德勒心理学"，特别是在教育和人际关系中的应用。

**推荐理由**：从理论到实践，学习如何将阿德勒心理学应用到日常生活中。', 3),

('《儿童的人格形成及其教育》', '阿尔弗雷德·阿德勒 | 阿德勒教育思想', 'book',
'阿德勒关于儿童教育的经典著作。探讨儿童人格的形成过程，以及如何通过正确的教育方式帮助儿童健康成长。

**推荐理由**：对育儿和教育感兴趣的读者必读。', 4);
