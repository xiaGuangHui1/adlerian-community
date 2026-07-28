import { useState, useEffect, type FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Post, CheckIn, UserProfile, CheckInStats, CATEGORIES } from '../types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return d.toLocaleDateString('zh-CN');
}

function formatCheckinDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function cleanPostContent(content: string): string {
  return content?.replace(/[#[\]*`>()!-]/g, '').substring(0, 140) || '';
}

function getCheckinTheme(content: string): string {
  if (content.includes('课题') || content.includes('阿德勒') || content.includes('共同体')) {
    return '阿德勒实践';
  }
  if (content.includes('运动') || content.includes('跑') || content.includes('瑜伽')) {
    return '身体行动';
  }
  if (content.includes('阅读') || content.includes('书')) {
    return '阅读反思';
  }
  if (content.includes('早起') || content.includes('清晨')) {
    return '生活节律';
  }
  return '勇气打卡';
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user: authUser,
    profile: authProfile,
    loading: authLoading,
    fetchProfile,
    registerProfile,
    updateProfile,
  } = useAuth();
  const isOwnProfile = authProfile?.id === id;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [checkinStats, setCheckinStats] = useState<CheckInStats>({ totalDays: 0, streak: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [checkinsLoading, setCheckinsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (id !== 'me') return;
    if (authLoading) return;

    let active = true;
    const openMyProfile = async () => {
      if (!authUser) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const existing = authProfile || await fetchProfile();
        if (!active) return;
        if (existing) {
          navigate(`/profile/${existing.id}`, { replace: true });
          return;
        }

        const fallbackName = authUser.email?.split('@')[0] || '社区成员';
        const created = await registerProfile(fallbackName);
        if (active) {
          navigate(`/profile/${created.id}`, { replace: true });
        }
      } catch {
        if (active) {
          setNotFound(true);
        }
      }
    };

    void openMyProfile();
    return () => {
      active = false;
    };
  }, [authLoading, authProfile, authUser, fetchProfile, id, navigate, registerProfile]);

  useEffect(() => {
    if (!id || id === 'me') return;
    let active = true;

    const loadProfile = async () => {
      await Promise.resolve();
      if (!active) return;

      setLoading(true);
      setNotFound(false);
      setActiveTab(0);
      setPostsLoading(true);
      setCheckinsLoading(true);

      try {
        const { data } = await api.get<UserProfile>(`/users/${id}`);
        if (!active) return;
        setProfile(data);
        setEditing(false);
        setSaveError('');
        document.title = `${data.nickname}的个人主页 - 阿德勒心理学社区`;

        const [postsResult, checkinsResult] = await Promise.allSettled([
          api.get<{ content?: Post[] }>(`/posts/user/${id}`, { params: { size: 20 } }),
          Promise.all([
            api.get<CheckIn[]>(`/checkins/user/${id}`),
            api.get<CheckInStats>(`/checkins/user/${id}/stats`),
          ]),
        ]);
        if (!active) return;

        setPosts(postsResult.status === 'fulfilled' ? postsResult.value.data.content || [] : []);
        if (checkinsResult.status === 'fulfilled') {
          const [checkinRes, statsRes] = checkinsResult.value;
          setCheckins(checkinRes.data || []);
          setCheckinStats(statsRes.data);
        } else {
          setCheckins([]);
          setCheckinStats({ totalDays: 0, streak: 0 });
        }
      } catch {
        if (active) {
          setNotFound(true);
          setProfile(null);
        }
      } finally {
        if (active) {
          setPostsLoading(false);
          setCheckinsLoading(false);
          setLoading(false);
        }
      }
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, [id]);

  const startEditing = () => {
    if (!profile) return;
    setNickname(profile.nickname);
    setAvatarUrl(profile.avatarUrl || '');
    setBio(profile.bio || '');
    setSaveError('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setSaveError('');
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      setSaveError('昵称不能为空');
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const updated = await updateProfile({
        nickname: trimmedNickname,
        avatarUrl: avatarUrl.trim(),
        bio: bio.trim(),
      });
      setProfile(updated);
      setEditing(false);
    } catch {
      setSaveError('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  // 404 state
  if (notFound) {
    return (
      <div className="text-center py-24">
        <Icon icon="ph:user-sound-fill" width="64" className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-400 mb-2">该伙伴尚未加入勇气工坊</h2>
        <p className="text-gray-400 mb-6">也许Ta正在寻找自己的勇气之路，期待与Ta相遇。</p>
        <Link
          to="/forum"
          className="inline-block bg-peach-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-peach-600 transition-all no-underline"
        >
          前往同行广场
        </Link>
      </div>
    );
  }

  // loading state
  if (loading || !profile) {
    return <div className="text-center py-24 text-gray-400">加载中...</div>;
  }

  const categoryLabel = (catVal: string) => {
    const cat = CATEGORIES.find(c => c.value === catVal);
    return cat ? cat.label : catVal;
  };

  const categoryIcon = (catVal: string) => {
    const cat = CATEGORIES.find(c => c.value === catVal);
    return cat && 'icon' in cat ? cat.icon : '';
  };

  const profileInitial = profile.nickname.trim().charAt(0) || '勇';
  const joinTime = profile.createdAt
    ? `${new Date(profile.createdAt).getFullYear()}年加入勇气工坊`
    : '加入时间未知';
  const aboutParagraphs = profile.bio
    ? profile.bio.split(/\n+/).map(item => item.trim()).filter(Boolean)
    : [];
  const interestTags = Array.from(new Set([
    ...posts.map(post => categoryLabel(post.category)).filter(Boolean),
    ...checkins.map(checkin => getCheckinTheme(checkin.content)),
    '课题分离',
    '共同体感觉',
  ])).slice(0, 8);
  const tabs = [
    { index: 0, label: '我的帖子', count: posts.length },
    { index: 1, label: '我的打卡', count: checkinStats.totalDays || checkins.length },
    { index: 2, label: '关于我' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* 个人信息卡片 */}
      <section className="bg-white rounded-3xl shadow-sm border border-peach-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-peach-500/12 via-warm-50 to-teal-500/12 h-32 relative">
          <div className="absolute inset-x-8 top-6 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-peach-500">
              勇气工坊 · 个人主页
            </span>
            {isOwnProfile && (
              <button
                type="button"
                onClick={editing ? cancelEditing : startEditing}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/85 text-peach-600 rounded-xl text-xs font-bold hover:bg-white transition-colors no-underline shadow-sm"
              >
                <Icon icon={editing ? 'ph:x' : 'ph:pencil-simple'} width="15" />
                {editing ? '取消编辑' : '编辑资料'}
              </button>
            )}
          </div>
          <div className="absolute -bottom-16 left-6 sm:left-8">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.nickname}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-peach-300 to-teal-300 flex items-center justify-center text-4xl text-white">
                {profileInitial}
              </div>
            )}
          </div>
        </div>
        <div className="pt-20 pb-8 px-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
              <h1 className="text-3xl font-bold text-brown-900">{profile.nickname}</h1>
                <p className="text-gray-500 mt-2 text-lg leading-relaxed">
                  {profile.bio || '在勇气工坊慢慢寻找自己的节奏'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Icon icon="ph:calendar-check-fill" width="18" className="text-peach-500" />
                <span>{joinTime}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-warm-50 border border-peach-100/60 px-4 py-3">
                <p className="text-2xl font-black text-brown-900">{posts.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">发布帖子</p>
              </div>
              <div className="rounded-2xl bg-warm-50 border border-peach-100/60 px-4 py-3">
                <p className="text-2xl font-black text-peach-500">{checkinStats.totalDays}</p>
                <p className="text-xs text-gray-400 mt-0.5">累计打卡</p>
              </div>
              <div className="rounded-2xl bg-warm-50 border border-peach-100/60 px-4 py-3">
                <p className="text-2xl font-black text-teal-500">{checkinStats.streak}</p>
                <p className="text-xs text-gray-400 mt-0.5">连续天数</p>
              </div>
            </div>
          </div>

          {isOwnProfile && editing && (
            <form
              onSubmit={handleSaveProfile}
              className="mt-7 rounded-2xl border border-peach-100 bg-warm-50/70 p-5 space-y-4"
            >
              {saveError && (
                <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  {saveError}
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  maxLength={50}
                  required
                  className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">头像 URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">个人简介</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={4}
                  maxLength={300}
                  placeholder="写一点你想让伙伴们了解的内容"
                  className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-white resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{bio.length}/300</p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 bg-transparent border-0 cursor-pointer transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-peach-500 text-white rounded-lg text-sm font-medium border-0 cursor-pointer hover:bg-peach-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon icon={saving ? 'ph:circle-notch' : 'ph:check'} width="16" />
                  {saving ? '保存中...' : '保存资料'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Tab 切换栏 */}
      <div className="flex border-b border-peach-100 mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.index}
            type="button"
            className={`px-5 sm:px-6 py-4 text-sm font-bold transition-colors border-b-2 -mb-px whitespace-nowrap cursor-pointer bg-transparent ${
              activeTab === tab.index
                ? 'text-peach-500 border-peach-500'
                : 'text-gray-400 border-transparent hover:text-peach-500'
            }`}
            onClick={() => setActiveTab(tab.index)}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                activeTab === tab.index ? 'bg-peach-100 text-peach-700' : 'bg-white text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1：我的帖子 */}
      {activeTab === 0 && (
        <div className="animate-[fadeIn_0.3s_ease] space-y-4">
          {postsLoading ? (
            <div className="text-center py-12 text-gray-400">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Icon icon="ph:note-pencil" width="40" className="text-gray-300 mx-auto mb-3" />
              <p>还没有发布帖子</p>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-peach-50 cursor-pointer group"
                onClick={() => navigate(`/forum/${post.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs bg-peach-100 text-peach-600 font-bold px-3 py-1 rounded-full">
                    {categoryIcon(post.category)}{categoryLabel(post.category)}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-peach-500 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                  {cleanPostContent(post.content)}
                </p>
                <div className="flex items-center gap-5 text-gray-400 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon icon="ph:chat-circle-text" width="16" />
                    {post.commentCount} 条评论
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon icon="ph:heart" width="16" />
                    {post.encouragementCount} 个鼓励
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Tab 2：我的打卡 */}
      {activeTab === 1 && (
        <div className="animate-[fadeIn_0.3s_ease]">
          {/* 连续打卡天数徽章 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-peach-50 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-peach-500 to-peach-600 rounded-2xl flex items-center justify-center shadow-lg shadow-peach-200 animate-[pulse_2s_ease-in-out_infinite]">
              <Icon icon="ph:fire-fill" width="28" className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-peach-500">{checkinStats.streak}</p>
              <p className="text-xs text-gray-400">连续打卡天数</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-lg font-black text-brown-900">{checkinStats.totalDays}</p>
              <p className="text-xs text-gray-400">累计实践</p>
            </div>
          </div>

          {/* 打卡时间线 */}
          {checkinsLoading ? (
            <div className="text-center py-12 text-gray-400">加载中...</div>
          ) : checkins.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Icon icon="ph:calendar-x" width="40" className="text-gray-300 mx-auto mb-3" />
              <p>还没有打卡记录</p>
            </div>
          ) : (
            <div>
              {checkins.map((checkin, idx) => {
                const isLast = idx === checkins.length - 1;
                return (
                  <div key={checkin.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-peach-400 flex-shrink-0 mt-1.5" />
                      {!isLast && <div className="w-0.5 flex-grow bg-peach-100 mt-1" />}
                    </div>
                    <div className={`flex-grow bg-white rounded-2xl p-5 shadow-sm border border-peach-50 ${isLast ? 'mb-0' : 'mb-4'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-teal-600">
                          {getCheckinTheme(checkin.content)}
                        </span>
                        <span className="text-xs text-gray-400">{formatCheckinDate(checkin.checkinDate)}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{checkin.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3：关于我 */}
      {activeTab === 2 && (
        <div className="animate-[fadeIn_0.3s_ease]">
          {/* 个人简介 */}
          <div className="bg-white rounded-3xl shadow-sm border border-peach-50 overflow-hidden mb-6">
            <div className="px-8 py-8">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <Icon icon="ph:user-focus-fill" width="22" className="text-peach-500" />
                <span>个人简介</span>
              </h3>
              <div className="text-gray-600 leading-relaxed space-y-4">
                {aboutParagraphs.length > 0 ? (
                  aboutParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))
                ) : (
                  <p className="text-gray-400">
                    这个人还没有写个人简介。也许正在用行动慢慢说明自己。
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 感兴趣的主题 */}
          <div className="bg-white rounded-3xl shadow-sm border border-peach-50 overflow-hidden mb-6">
            <div className="px-8 py-8">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <Icon icon="ph:target-fill" width="22" className="text-teal-500" />
                <span>感兴趣的打卡主题</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {interestTags.map(tag => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-peach-50 text-peach-600 rounded-xl text-sm font-medium"
                  >
                    # {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 横向关系说明卡片 */}
          <div className="bg-gradient-to-br from-peach-50/60 to-teal-50/60 rounded-3xl p-8 border border-peach-100/40">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-peach-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Icon icon="ph:hand-heart-fill" width="26" className="text-peach-500" />
              </div>
              <div>
                <h4 className="font-bold text-brown-900 mb-2">横向关系 · 彼此陪伴</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  在这里，我们不评价他人，只是彼此陪伴。每个人都有自己的成长节奏，没有比较，没有评判。我们以横向关系相待，互相见证勇气的绽放。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
