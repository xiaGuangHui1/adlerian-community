import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../lib/api';
import Skeleton from '../components/Skeleton';
import { InterestCircle } from '../types';
import { useAuth } from '../hooks/useAuth';

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export default function InterestCircles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [circles, setCircles] = useState<InterestCircle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCircles = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const { data } = await api.get<InterestCircle[]>('/circles');
      setCircles(data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchCircles();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchCircles]);

  const handleJoin = async (circleId: number) => {
    try {
      await api.post(`/circles/${circleId}/join`);
      await fetchCircles();
    } catch (error: unknown) {
      alert('加入失败：' + getErrorMessage(error, '请确认已登录'));
    }
  };

  const handleLeave = async (circleId: number) => {
    try {
      await api.post(`/circles/${circleId}/leave`);
      await fetchCircles();
    } catch (error: unknown) {
      alert('退出失败：' + getErrorMessage(error, '请稍后重试'));
    }
  };

  return (
    <div>
      {/* 开发中横幅 */}
      <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl px-4 py-3 flex items-center gap-3">
        <span className="text-xl">🚧</span>
        <div>
          <p className="font-bold text-sm">社会兴趣功能正在开发中</p>
          <p className="text-xs opacity-80">当前仅作预览，暂不可参与，敬请期待后续迭代上线</p>
        </div>
      </div>

      <div className="pointer-events-none select-none opacity-90">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-stone-800">社会兴趣</h1>
        </div>

      <p className="text-sm text-stone-500 mb-6">
        加入你感兴趣的话题圈子，与志同道合的朋友分享交流。每个人都可以在多个圈子中自由参与。
      </p>

      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {circles.map((circle) => (
            <div
              key={circle.id}
              className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/circles/${circle.id}`)}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{circle.icon || '💬'}</span>
                <div>
                  <h3 className="text-base font-medium text-stone-800">{circle.name}</h3>
                  <div className="text-xs text-stone-400 mt-0.5">
                    <span>{circle.memberCount} 成员</span>
                    <span className="mx-1.5">·</span>
                    <span>{circle.postCount} 帖子</span>
                  </div>
                </div>
              </div>
              {circle.description && (
                <p className="text-sm text-stone-500 line-clamp-2">{circle.description}</p>
              )}
              {user && (
                <div className="mt-3 pt-3 border-t border-stone-100">
                  {circle.joined ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeave(circle.id);
                      }}
                      className="text-xs text-stone-500 border border-stone-200 bg-white px-3 py-1 rounded cursor-pointer hover:bg-stone-50"
                    >
                      退出圈子
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoin(circle.id);
                      }}
                      className="text-xs text-white bg-amber-700 border-0 px-3 py-1 rounded cursor-pointer hover:bg-amber-800"
                    >
                      加入圈子
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {circles.length === 0 && (
            <div className="col-span-full text-center py-12 text-stone-400">
              暂无圈子
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
