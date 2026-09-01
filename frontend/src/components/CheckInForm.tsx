import { useState } from 'react';
import api from '../lib/api';
import { CheckIn, CATEGORIES } from '../types';

const CHECKIN_TEMPLATE = `【幸福】今天让我感到幸福的事：


【爱自己】今天我这样善待了自己：


【爱他人】今天我这样关心了他人：
`;

function defaultForumTitle() {
  const d = new Date();
  return `我的实践分享 · ${d.getMonth() + 1}月${d.getDate()}日`;
}

interface CheckInFormProps {
  initialData?: CheckIn | null;
  onSuccess: (checkIn: CheckIn) => void;
  onCancel?: () => void;
}

export default function CheckInForm({ initialData, onSuccess, onCancel }: CheckInFormProps) {
  const [content, setContent] = useState(initialData?.content || CHECKIN_TEMPLATE);
  const [submitting, setSubmitting] = useState(false);
  const [syncToForum, setSyncToForum] = useState(false);
  const [forumTitle, setForumTitle] = useState('');
  const [forumCategory, setForumCategory] = useState('life-courage');

  const isBlank = content.trim() === '' || content.trim() === CHECKIN_TEMPLATE.trim();

  const handleSubmit = async () => {
    if (isBlank) return;
    setSubmitting(true);
    try {
      const { data } = await api.post<CheckIn>('/checkins', {
        content,
        syncToForum,
        forumTitle,
        forumCategory,
      });
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

      {/* 同步到同行广场 */}
      <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={syncToForum}
          onChange={e => setSyncToForum(e.target.checked)}
          className="w-4 h-4 accent-peach-500"
        />
        <span className="text-sm text-gray-600">同步到同行广场</span>
      </label>

      {syncToForum && (
        <div className="mt-3 p-3 bg-warm-50 rounded-lg space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">帖子标题（留空自动生成）</label>
            <input
              type="text"
              value={forumTitle}
              onChange={e => setForumTitle(e.target.value)}
              maxLength={200}
              placeholder={defaultForumTitle()}
              className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">话题分类</label>
            <select
              value={forumCategory}
              onChange={e => setForumCategory(e.target.value)}
              className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-white"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

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
