import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Avatar from '../components/Avatar';
import { useAuth } from '../hooks/useAuth';
import type { Message, Conversation, Author } from '../types';

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const myId = profile?.id;

  const [otherUser, setOtherUser] = useState<Author | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchInitial = useCallback(async () => {
    try {
      const [convRes, msgRes] = await Promise.all([
        api.get<Conversation>(`/conversations/${conversationId}`),
        api.get<Message[]>(`/conversations/${conversationId}/messages`),
      ]);
      setOtherUser(convRes.data.otherUser);
      setMessages(msgRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void fetchInitial();
  }, [fetchInitial]);

  // 标记已读 + 每 5 秒轮询新消息
  useEffect(() => {
    const markRead = () => {
      api.post(`/conversations/${conversationId}/read`).catch(() => {});
    };
    markRead();
    const timer = window.setInterval(async () => {
      try {
        const { data } = await api.get<Message[]>(`/conversations/${conversationId}/messages`);
        setMessages(data);
        markRead();
      } catch {
        // ignore
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const { data } = await api.post<Message>(`/conversations/${conversationId}/messages`, { content: text });
      setMessages((prev) => [...prev, data]);
      setContent('');
    } catch {
      alert('发送失败');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-400">加载中...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 9rem)' }}>
      {/* 头部 */}
      <div className="flex items-center gap-3 py-3 border-b border-orange-50">
        <button
          onClick={() => navigate('/messages')}
          className="text-sm text-gray-400 hover:text-peach-700 bg-transparent border-0 cursor-pointer"
        >
          &larr; 返回
        </button>
        {otherUser && (
          <div className="flex items-center gap-2">
            <Avatar name={otherUser.nickname} src={otherUser.avatarUrl} className="w-8 h-8" textClassName="text-xs" />
            <span className="font-bold text-brown-900">{otherUser.nickname}</span>
          </div>
        )}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-3 py-4">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-gray-400">开始聊天吧</div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === myId;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    mine ? 'bg-peach-500 text-white' : 'bg-white border border-orange-50 text-gray-700'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* 输入框 */}
      <div className="flex gap-2 pt-3 border-t border-orange-50">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="写点什么..."
          maxLength={2000}
          className="flex-1 px-4 py-2.5 border border-peach-100 rounded-2xl text-sm focus:outline-none focus:border-peach-400 bg-white"
        />
        <button
          onClick={handleSend}
          disabled={sending || !content.trim()}
          className="px-5 py-2.5 bg-peach-500 text-white rounded-2xl text-sm font-bold hover:bg-peach-600 transition-colors cursor-pointer border-0 disabled:opacity-50"
        >
          发送
        </button>
      </div>
    </div>
  );
}
