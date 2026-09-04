import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Avatar from '../components/Avatar';
import Skeleton from '../components/Skeleton';
import type { Notification, PageResponse } from '../types';

function timeAgo(time: string) {
  const diff = Date.now() - new Date(time).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

function notificationText(n: Notification): string {
  switch (n.type) {
    case 'comment': return '评论了你的帖子';
    case 'reply': return '回复了你的评论';
    case 'encouragement': return '给了你一份鼓励';
    case 'team': return '加入了你的队伍';
    default: return '与你互动';
  }
}

function notificationRoute(n: Notification): string | null {
  if (n.type === 'team') return '/invite';
  if (n.targetType === 'post' && n.targetId) return `/forum/${n.targetId}`;
  if (n.targetType === 'checkin') return '/checkin';
  if ((n.type === 'comment' || n.type === 'reply') && n.targetId) return `/forum/${n.targetId}`;
  return null;
}

export default function Messages() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PageResponse<Notification>>('/notifications?page=0&size=50');
      setNotifications(data.content);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNotifications();
  }, []);

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      try {
        await api.post(`/notifications/${n.id}/read`);
      } catch {
        // ignore
      }
    }
    const route = notificationRoute(n);
    if (route) navigate(route);
  };

  const handleReadAll = async () => {
    setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
    try {
      await api.post('/notifications/read-all');
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-brown-900">消息中心</h1>
        <button
          onClick={handleReadAll}
          className="text-sm text-peach-500 hover:text-peach-700 bg-transparent border-0 cursor-pointer font-medium"
        >
          全部已读
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-orange-50 flex gap-3 animate-pulse">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">🔔</div>
          <p>还没有消息</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`bg-white p-4 rounded-2xl border flex gap-3 cursor-pointer transition-colors hover:bg-warm-50 ${
                n.read ? 'border-orange-50' : 'border-peach-200'
              }`}
            >
              <Avatar
                name={n.actorNickname || '勇'}
                src={n.actorAvatarUrl}
                className="w-10 h-10 flex-shrink-0"
                textClassName="text-xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-gray-800">{n.actorNickname || '社区伙伴'}</span>
                  <span className="text-sm text-gray-600">{notificationText(n)}</span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
                </div>
                {n.content && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.content}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
