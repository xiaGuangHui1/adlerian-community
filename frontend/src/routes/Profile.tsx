import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { Encouragement } from '../types';

interface ProfileData {
  id: string;
  nickname: string;
  avatarUrl?: string;
  bio?: string;
}

interface UserStats {
  posts: number;
  checkIns: number;
  encouragements: number;
}

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [encouragements, setEncouragements] = useState<Encouragement[]>([]);
  const [stats, setStats] = useState<UserStats>({ posts: 0, checkIns: 0, encouragements: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ProfileData>(`/users/${id}`);
      setProfile(data);
      try {
        const encRes = await api.get<Encouragement[]>('/encouragements/received');
        setEncouragements(encRes.data);
        setStats(prev => ({ ...prev, encouragements: encRes.data.length }));
      } catch {
        // not the current user's profile
      }
      try {
        const statsRes = await api.get('/checkins/stats');
        setStats(prev => ({ ...prev, checkIns: statsRes.data.totalDays || 0 }));
      } catch {
        // ignore
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return <div className="text-center py-12 text-gray-400">加载中...</div>;
  }

  const totalActivity = stats.posts + stats.checkIns + stats.encouragements;
  const badges = [
    { earned: stats.checkIns >= 7, label: '一周小成', icon: '🌱' },
    { earned: stats.checkIns >= 30, label: '月度达人', icon: '🌟' },
    { earned: stats.checkIns >= 100, label: '百日勇者', icon: '🔥' },
    { earned: stats.encouragements >= 10, label: '鼓励达人', icon: '💝' },
    { earned: totalActivity >= 50, label: '活跃伙伴', icon: '⚡' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* 个人信息 */}
      <div className="bg-white p-6 rounded-xl border border-peach-100 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-peach-200 to-teal-200 rounded-full mx-auto flex items-center justify-center text-2xl text-peach-700 mb-4">
          {profile.nickname.charAt(0)}
        </div>
        <h1 className="text-xl font-semibold text-brown-900">{profile.nickname}</h1>
        {profile.bio && (
          <p className="text-sm text-gray-400 mt-2">{profile.bio}</p>
        )}

        {/* 统计卡片 */}
        <div className="flex justify-center gap-6 mt-5 pt-5 border-t border-peach-50">
          <div className="text-center">
            <div className="text-lg font-bold text-peach-700">{stats.checkIns}</div>
            <div className="text-xs text-gray-400">打卡天数</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-peach-700">{stats.encouragements}</div>
            <div className="text-xs text-gray-400">收到鼓励</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-teal-700">{totalActivity}</div>
            <div className="text-xs text-gray-400">活跃指数</div>
          </div>
        </div>
      </div>

      {/* 徽章 */}
      <div className="mt-6 bg-white p-5 rounded-xl border border-peach-100">
        <h2 className="text-sm font-semibold text-brown-900 mb-4">成就徽章</h2>
        <div className="flex flex-wrap gap-3">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm ${
                badge.earned
                  ? 'bg-gradient-to-br from-peach-50 to-teal-50 border-peach-200 text-brown-900'
                  : 'bg-gray-50 border-gray-100 text-gray-300'
              }`}
            >
              <span className={badge.earned ? '' : 'opacity-40'}>{badge.icon}</span>
              <span className="text-xs">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 鼓励墙 */}
      {encouragements.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium text-brown-900 mb-4">
            收到的鼓励
          </h2>
          <div className="space-y-3">
            {encouragements.map((e) => (
              <div key={e.id} className="bg-white p-4 rounded-xl border border-peach-100">
                <p className="text-sm text-gray-600">{e.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  — {e.anonymous ? '匿名' : e.sender?.nickname}
                  <span className="ml-2">
                    {new Date(e.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
