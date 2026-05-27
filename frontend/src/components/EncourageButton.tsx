import { useState } from 'react';
import api from '../lib/api';
import type { Encouragement } from '../types';

interface Props {
  targetType: 'post' | 'comment';
  targetId: number;
  encouragements: Encouragement[];
  onNewEncouragement?: (e: Encouragement) => void;
}

export default function EncourageButton({ targetType, targetId, encouragements, onNewEncouragement }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showList, setShowList] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(
        `/encouragements?targetType=${targetType}&targetId=${targetId}`,
        { message, anonymous }
      );
      onNewEncouragement?.(data);
      setMessage('');
      setOpen(false);
    } catch {
      alert('发送失败，请确认已登录');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="inline-block">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className="text-sm text-peach-700 hover:text-peach-800 bg-peach-50 hover:bg-peach-100 border border-peach-200 rounded-full px-3 py-1 cursor-pointer transition-colors"
        >
          给予鼓励
        </button>
        {encouragements.length > 0 && (
          <button
            onClick={() => setShowList(!showList)}
            className="text-xs text-gray-400 hover:text-peach-700 bg-transparent border-0 cursor-pointer"
          >
            {encouragements.length}条鼓励
          </button>
        )}
      </div>

      {/* 发送鼓励表单 */}
      {open && (
        <div className="mt-2 p-3 bg-peach-50 rounded-lg border border-peach-200">
          <p className="text-xs text-peach-700 mb-2">
            写下你的鼓励（关注过程和努力，而非评判结果）
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="例如：我看到了你在这方面持续的努力和思考..."
            className="w-full p-2 border border-peach-200 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-peach-400"
            rows={3}
          />
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="rounded"
              />
              匿名鼓励
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-gray-400 bg-transparent border-0 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || submitting}
                className="text-xs text-white bg-peach-500 hover:bg-peach-600 px-3 py-1 rounded cursor-pointer disabled:opacity-50 border-0"
              >
                发送鼓励
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 鼓励列表 */}
      {showList && encouragements.length > 0 && (
        <div className="mt-2 space-y-2">
          {encouragements.map((e) => (
            <div key={e.id} className="p-2 bg-peach-50 rounded text-sm">
              <p className="text-brown-900">{e.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                — {e.anonymous ? '匿名' : e.sender?.nickname}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
