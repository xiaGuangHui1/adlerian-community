import { useState, useEffect } from 'react';
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

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const isOwnProfile = auth.profile?.id === id;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [checkinStats, setCheckinStats] = useState<CheckInStats>({ totalDays: 0, streak: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [checkinsLoading, setCheckinsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
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
          前往互助广场
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* 个人信息卡片 */}
      <div className="bg-white rounded-3xl shadow-sm border border-peach-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-peach-200/40 to-teal-200/40 h-32 relative">
          <div className="absolute -bottom-16 left-8">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.nickname}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-peach-300 to-teal-300 flex items-center justify-center text-4xl text-white">
                {profile.nickname.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="pt-20 pb-8 px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-brown-900">{profile.nickname}</h1>
              <p className="text-gray-400 mt-2 text-lg">{profile.bio || '这个人很神秘，什么都没写'}</p>
              <div className="flex items-center gap-2 mt-4">
                <Icon icon="ph:calendar-check-fill" width="18" className="text-peach-500" />
                <span className="text-sm text-gray-400">
                  {profile.createdAt
                    ? `${new Date(profile.createdAt).getFullYear()}年加入勇气工坊`
                    : '加入时间未知'}
                </span>
              </div>
            </div>
            {isOwnProfile && (
              <Link
                to="/profile/edit"
                className="flex items-center gap-1.5 px-4 py-2 bg-peach-50 text-peach-600 rounded-xl text-sm font-medium hover:bg-peach-100 transition-colors no-underline"
              >
                <Icon icon="ph:pencil-simple" width="16" />
                编辑资料
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tab 切换栏 */}
      <div className="flex border-b border-peach-100 mb-8">
        <button
          className={`px-6 py-4 text-sm font-bold transition-colors border-b-2 -mb-px ${
            activeTab === 0
              ? 'text-peach-500 border-peach-500'
              : 'text-gray-400 border-transparent hover:text-peach-500'
          }`}
          onClick={() => setActiveTab(0)}
        >
          我的帖子
        </button>
        <button
          className={`px-6 py-4 text-sm font-bold transition-colors border-b-2 -mb-px ${
            activeTab === 1
              ? 'text-peach-500 border-peach-500'
              : 'text-gray-400 border-transparent hover:text-peach-500'
          }`}
          onClick={() => setActiveTab(1)}
        >
          我的打卡
        </button>
        <button
          className={`px-6 py-4 text-sm font-bold transition-colors border-b-2 -mb-px ${
            activeTab === 2
              ? 'text-peach-500 border-peach-500'
              : 'text-gray-400 border-transparent hover:text-peach-500'
          }`}
          onClick={() => setActiveTab(2)}
        >
          关于我
        </button>
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
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {post.content?.replace(/[#[\]*`>()!-]/g, '').substring(0, 120) || ''}
                </p>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Icon icon="ph:chat-circle-text" width="16" />
                  <span>{post.commentCount} 条评论</span>
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
                        <span className="text-xs font-bold text-teal-600">勇气打卡</span>
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
                {profile.bio ? (
                  <p>{profile.bio}</p>
                ) : (
                  <p className="text-gray-400">这个人很神秘，还没有写个人简介。</p>
                )}
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
