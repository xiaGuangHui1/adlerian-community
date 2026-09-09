import { useState } from 'react';
import api from '../lib/api';
import { CheckIn, CATEGORIES } from '../types';

const CHECKIN_TEMPLATE = `[Happiness] Something that made me happy today:


[Love myself] How I was kind to myself today:


[Love others] How I cared for someone today:
`;

function defaultForumTitle() {
  const d = new Date();
  return `Practice · ${d.getMonth() + 1}/${d.getDate()}`;
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
  const [forumCategory, setForumCategory] = useState('practice-checkin');

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
      alert('Failed to check in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-peach-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-brown-900">
          {initialData ? "Edit today's check-in" : "Today's check-in"}
        </h2>
        <span className="text-xs text-gray-400">Just write a few words after each bracket</span>
      </div>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={8}
        maxLength={2000}
        className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm leading-relaxed resize-y focus:outline-none focus:border-peach-400 bg-warm-50"
      />

      {/* 同步到交流广场 */}
      <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={syncToForum}
          onChange={e => setSyncToForum(e.target.checked)}
          className="w-4 h-4 accent-peach-500"
        />
        <span className="text-sm text-gray-600">Sync to Community</span>
      </label>

      {syncToForum && (
        <div className="mt-3 p-3 bg-warm-50 rounded-lg space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Post title (auto-generated if empty)</label>
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
            <label className="block text-xs text-gray-500 mb-1">Category</label>
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
          {submitting ? 'Submitting...' : initialData ? 'Update' : 'Check In'}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm border border-peach-100 text-gray-400 cursor-pointer hover:bg-peach-50 bg-white"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
