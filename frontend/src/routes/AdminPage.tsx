import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { Resource } from '../types';

const TYPE_OPTIONS = [
  { value: 'concept', label: '核心概念' },
  { value: 'book', label: '推荐阅读' },
  { value: 'quote', label: '经典引述' },
  { value: 'bio', label: '阿德勒生平' },
  { value: 'practice', label: '实践指南' },
  { value: 'article', label: '实践指南（文章）' },
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
      alert('标题和内容不能为空');
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
      alert('发布成功');
    } catch {
      alert('发布失败，请确认已登录');
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
    api.put('/resources/reorder', next.map((r) => r.id)).catch(() => alert('排序保存失败'));
  };

  if (authLoading || loading) {
    return <div className="max-w-3xl mx-auto py-16 text-center text-gray-400">加载中…</div>;
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-gray-500">
        请先登录后再使用发布后台
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-brown-900 mb-6">发布文章</h1>

      {/* 发布表单 */}
      <div className="bg-white p-6 rounded-2xl border border-orange-50 shadow-sm mb-8 space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="标题"
          className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="简介（可选）"
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
          placeholder="正文（支持 Markdown）"
          rows={12}
          className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm resize-y font-mono focus:outline-none focus:border-peach-400"
        />
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="w-full py-3 bg-peach-500 text-white rounded-xl font-bold hover:bg-peach-600 cursor-pointer border-0 disabled:opacity-50"
        >
          {publishing ? '发布中…' : '发布'}
        </button>
      </div>

      {/* 排序列表 */}
      <h2 className="text-lg font-bold text-brown-900 mb-3">文章排序（点 ↑/↓ 调整，自动保存）</h2>
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
              ↑ 上移
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === resources.length - 1}
              className="text-xs text-gray-400 hover:text-peach-600 bg-transparent border-0 cursor-pointer disabled:opacity-30"
            >
              ↓ 下移
            </button>
          </div>
        ))}
        {resources.length === 0 && <p className="text-sm text-gray-400 text-center py-8">暂无文章</p>}
      </div>
    </div>
  );
}
