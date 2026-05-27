import { useState } from 'react';
import api from '../lib/api';
import { CheckIn } from '../types';

const CHECKIN_TEMPLATE = `【幸福】今天让我感到幸福的事：


【爱自己】今天我这样善待了自己：


【爱他人】今天我这样关心了他人：
`;

interface CheckInFormProps {
  initialData?: CheckIn | null;
  onSuccess: (checkIn: CheckIn) => void;
  onCancel?: () => void;
}

export default function CheckInForm({ initialData, onSuccess, onCancel }: CheckInFormProps) {
  const [content, setContent] = useState(initialData?.content || CHECKIN_TEMPLATE);
  const [submitting, setSubmitting] = useState(false);

  const isBlank = content.trim() === '' || content.trim() === CHECKIN_TEMPLATE.trim();

  const handleSubmit = async () => {
    if (isBlank) return;
    setSubmitting(true);
    try {
      const { data } = await api.post<CheckIn>('/checkins', { content });
      onSuccess(data);
    } catch {
      alert('打卡失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-peach-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-brown-900">
          {initialData ? '修改今日打卡' : '今日打卡'}
        </h2>
        <span className="text-xs text-gray-400">在每个【】后面写几个字就行</span>
      </div>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={8}
        maxLength={2000}
        className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm leading-relaxed resize-y focus:outline-none focus:border-peach-400 bg-warm-50"
      />

      <div className="flex gap-3 mt-3">
        <button
          onClick={handleSubmit}
          disabled={isBlank || submitting}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border-0 ${
            !isBlank && !submitting
              ? 'bg-peach-500 text-white cursor-pointer hover:bg-peach-600'
              : 'bg-peach-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {submitting ? '提交中...' : initialData ? '更新打卡' : '完成打卡'}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm border border-peach-100 text-gray-400 cursor-pointer hover:bg-peach-50 bg-white"
          >
            取消
          </button>
        )}
      </div>
    </div>
  );
}
