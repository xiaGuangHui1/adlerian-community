import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { Resource } from '../types';

const TYPE_OPTIONS = [
  { value: 'concept', label: 'Core Concept' },
  { value: 'book', label: 'Books' },
  { value: 'quote', label: 'Quotes' },
  { value: 'bio', label: "Adler's Life" },
  { value: 'practice', label: 'Practice Guide' },
  { value: 'article', label: 'Practice Guide (Article)' },
];

const TYPE_LABEL: Record<string, string> = TYPE_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.value]: o.label }),
  {} as Record<string, string>
);

export default function AdminPage() {
  const { profile, loading: authLoading } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('concept');
  const [content, setContent] = useState('');
  const [publishing, setPublishing] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Resource[]>('/resources');
      setResources(Array.isArray(data) ? data : (data as { content?: Resource[] }).content || []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchResources();
  }, []);

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required');
      return;
    }
    setPublishing(true);
    try {
      await api.post('/resources', {
        title: title.trim(),
        description: description.trim(),
        type,
        content,
      });
      setTitle('');
      setDescription('');
      setContent('');
      await fetchResources();
      alert('Published');
    } catch {
      alert('Failed to publish. Please sign in.');
    } finally {
      setPublishing(false);
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= resources.length) return;
    const next = [...resources];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setResources(next);
    api.put('/resources/reorder', next.map((r) => r.id)).catch(() => alert('Failed to save order'));
  };

  if (authLoading || loading) {
    return <div className="max-w-3xl mx-auto py-16 text-center text-gray-400">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-gray-500">
        Please sign in to use the admin panel
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-brown-900 mb-6">Publish Article</h1>

      {/* 发布表单 */}
      <div className="bg-white p-6 rounded-2xl border border-orange-50 shadow-sm mb-8 space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm bg-white focus:outline-none focus:border-peach-400"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content (Markdown supported)"
          rows={12}
          className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm resize-y font-mono focus:outline-none focus:border-peach-400"
        />
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="w-full py-3 bg-peach-500 text-white rounded-xl font-bold hover:bg-peach-600 cursor-pointer border-0 disabled:opacity-50"
        >
          {publishing ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {/* 排序列表 */}
      <h2 className="text-lg font-bold text-brown-900 mb-3">Article order (click ↑/↓ to reorder, auto-saved)</h2>
      <div className="space-y-2">
        {resources.map((r, i) => (
          <div key={r.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-orange-50">
            <span className="text-xs text-gray-400 w-6 text-center">{i + 1}</span>
            <span className="text-xs bg-peach-50 text-peach-700 px-2 py-0.5 rounded whitespace-nowrap">
              {TYPE_LABEL[r.type] || r.type}
            </span>
            <span className="flex-1 text-sm text-brown-900 truncate">{r.title}</span>
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="text-xs text-gray-400 hover:text-peach-600 bg-transparent border-0 cursor-pointer disabled:opacity-30"
            >
              ↑ Up
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === resources.length - 1}
              className="text-xs text-gray-400 hover:text-peach-600 bg-transparent border-0 cursor-pointer disabled:opacity-30"
            >
              ↓ Down
            </button>
          </div>
        ))}
        {resources.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No articles yet</p>}
      </div>
    </div>
  );
}
