import { useState, useEffect, type FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import api from '../lib/api';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { Post, CheckIn, UserProfile, CheckInStats, CATEGORIES, Conversation } from '../types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString('en-US');
}

function formatCheckinDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function cleanPostContent(content: string): string {
  return content?.replace(/[#[\]*`>()!-]/g, '').substring(0, 140) || '';
}

function getCheckinTheme(content: string): string {
  if (content.includes('课题') || content.includes('阿德勒') || content.includes('共同体')) {
    return 'Adler Practice';
  }
  if (content.includes('运动') || content.includes('跑') || content.includes('瑜伽')) {
    return 'Body & Movement';
  }
  if (content.includes('阅读') || content.includes('书')) {
    return 'Reading & Reflection';
  }
  if (content.includes('早起') || content.includes('清晨')) {
    return 'Life Rhythm';
  }
  return 'Courage Check-in';
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
    signOut,
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

  const handleMessage = async () => {
    if (!profile) return;
    try {
      const { data } = await api.post<Conversation>('/conversations', { userId: profile.id });
      navigate(`/messages/dm/${data.id}`);
    } catch {
      alert('Failed to start conversation');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

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

        const fallbackName = authUser.email?.split('@')[0] || 'Community member';
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
        document.title = `${data.nickname}'s profile - Adlerian Community`;

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
      setSaveError('Nickname is required');
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
      setSaveError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // 404 state
  if (notFound) {
    return (
      <div className="text-center py-24">
        <Icon icon="ph:user-sound-fill" width="64" className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-400 mb-2">This member hasn't joined the Adlerian Community yet</h2>
        <p className="text-gray-400 mb-6">Maybe they're on their own journey of courage. We look forward to meeting them.</p>
        <Link
          to="/forum"
          className="inline-block bg-peach-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-peach-600 transition-all no-underline"
        >
          Go to Community
        </Link>
      </div>
    );
  }

  // loading state
  if (loading || !profile) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="bg-white rounded-3xl p-8 border border-orange-50 mb-6 flex items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    );
  }

  const categoryLabel = (catVal: string) => {
    const cat = CATEGORIES.find(c => c.value === catVal);
    return cat ? cat.label : catVal;
  };

  const categoryIcon = (catVal: string) => {
    const cat = CATEGORIES.find(c => c.value === catVal);
    return cat && 'icon' in cat ? cat.icon : '';
  };

  const profileInitial = profile.nickname.trim().charAt(0) || 'A';
  const joinTime = profile.createdAt
    ? `Joined the Adlerian Community in ${new Date(profile.createdAt).getFullYear()}`
    : 'Join date unknown';
  const aboutParagraphs = profile.bio
    ? profile.bio.split(/\n+/).map(item => item.trim()).filter(Boolean)
    : [];
  const interestTags = Array.from(new Set([
    ...posts.map(post => categoryLabel(post.category)).filter(Boolean),
    ...checkins.map(checkin => getCheckinTheme(checkin.content)),
    'Separation of Tasks',
    'Sense of Belonging',
  ])).slice(0, 8);
  const tabs = [
    { index: 0, label: 'My Posts', count: posts.length },
    { index: 1, label: 'My Check-ins', count: checkinStats.totalDays || checkins.length },
    { index: 2, label: 'About Me' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* 个人信息卡片 */}
      <section className="bg-white rounded-3xl shadow-sm border border-peach-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-peach-500/12 via-warm-50 to-teal-500/12 h-32 relative">
          <div className="absolute inset-x-8 top-6 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-peach-500">
              Adlerian Community · Profile
            </span>
            {isOwnProfile ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={editing ? cancelEditing : startEditing}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/85 text-peach-600 rounded-xl text-xs font-bold hover:bg-white transition-colors no-underline shadow-sm"
                >
                  <Icon icon={editing ? 'ph:x' : 'ph:pencil-simple'} width="15" />
                  {editing ? 'Cancel editing' : 'Edit profile'}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/85 text-gray-500 rounded-xl text-xs font-bold hover:bg-white transition-colors no-underline shadow-sm"
                >
                  <Icon icon="ph:sign-out" width="15" />
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleMessage}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/85 text-peach-600 rounded-xl text-xs font-bold hover:bg-white transition-colors no-underline shadow-sm"
              >
                <Icon icon="ph:chat-circle-dots-fill" width="15" />
                Message
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
                  {profile.bio || 'Finding my own rhythm in the Adlerian Community'}
                </p>
                {isOwnProfile && authUser?.email && (
                  <p className="text-gray-400 mt-1 text-sm flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    {authUser.email}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Icon icon="ph:calendar-check-fill" width="18" className="text-peach-500" />
                <span>{joinTime}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-warm-50 border border-peach-100/60 px-4 py-3">
                <p className="text-2xl font-black text-brown-900">{posts.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">Posts</p>
              </div>
              <div className="rounded-2xl bg-warm-50 border border-peach-100/60 px-4 py-3">
                <p className="text-2xl font-black text-peach-500">{checkinStats.totalDays}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total check-ins</p>
              </div>
              <div className="rounded-2xl bg-warm-50 border border-peach-100/60 px-4 py-3">
                <p className="text-2xl font-black text-teal-500">{checkinStats.streak}</p>
                <p className="text-xs text-gray-400 mt-0.5">Day streak</p>
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
                <label className="block text-sm text-gray-600 mb-1">Nickname</label>
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
                <label className="block text-sm text-gray-600 mb-1">Avatar URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={4}
                  maxLength={300}
                  placeholder="Write a little about yourself"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-peach-500 text-white rounded-lg text-sm font-medium border-0 cursor-pointer hover:bg-peach-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon icon={saving ? 'ph:circle-notch' : 'ph:check'} width="16" />
                  {saving ? 'Saving...' : 'Save'}
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
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Icon icon="ph:note-pencil" width="40" className="text-gray-300 mx-auto mb-3" />
              <p>No posts yet</p>
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
                    {post.commentCount} shares
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    {post.encouragementCount} thanks
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
              <p className="text-xs text-gray-400">Day streak</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-lg font-black text-brown-900">{checkinStats.totalDays}</p>
              <p className="text-xs text-gray-400">Total practice</p>
            </div>
          </div>

          {/* 打卡时间线 */}
          {checkinsLoading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : checkins.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Icon icon="ph:calendar-x" width="40" className="text-gray-300 mx-auto mb-3" />
              <p>No check-ins yet</p>
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
                <span>Bio</span>
              </h3>
              <div className="text-gray-600 leading-relaxed space-y-4">
                {aboutParagraphs.length > 0 ? (
                  aboutParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))
                ) : (
                  <p className="text-gray-400">
                    This member hasn't written a bio yet. Maybe they're expressing themselves through actions.
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
                <span>Interested Topics</span>
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
                <h4 className="font-bold text-brown-900 mb-2">Horizontal relationships · mutual companionship</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Here we don't judge others — we simply keep each other company. Everyone has their own pace of growth, with no comparison and no judgment. We treat each other as equals and witness each other's courage unfold.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
