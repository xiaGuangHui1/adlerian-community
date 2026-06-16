import { useState, useEffect } from 'react';
import api from '../lib/api';
import ReactMarkdown from 'react-markdown';
import { Resource } from '../types';

const TABS = [
  { key: 'concept', label: '核心概念' },
  { key: 'book', label: '推荐书籍' },
  { key: 'path', label: '学习路径' },
  { key: 'article', label: '文章专栏' },
];

export default function Learn() {
  const [tab, setTab] = useState('concept');
  const [resources, setResources] = useState<Resource[]>([]);
  const [selected, setSelected] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<Resource[]>(`/resources?type=${tab}`);
        setResources(data);
        setSelected(null);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };

    void fetchResources();
  }, [tab]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">学习资源</h1>

      {/* Tab切换 */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm cursor-pointer border-0 transition-colors ${
              tab === t.key ? 'bg-white text-amber-800 shadow-sm font-medium' : 'text-stone-500 hover:text-stone-700 bg-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400">加载中...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* 列表 */}
          <div className="space-y-3">
            {resources.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={`w-full text-left p-4 rounded-xl border cursor-pointer transition-colors ${
                  selected?.id === r.id
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-white border-stone-200 hover:border-amber-300'
                }`}
              >
                <h3 className="text-sm font-medium text-stone-800">{r.title}</h3>
                {r.description && (
                  <p className="text-xs text-stone-500 mt-1">{r.description}</p>
                )}
              </button>
            ))}
            {resources.length === 0 && (
              <p className="text-sm text-stone-400 text-center py-8">暂无内容</p>
            )}
          </div>

          {/* 详情 */}
          <div className="md:col-span-2">
            {selected ? (
              <div className="bg-white p-6 rounded-xl border border-stone-200">
                <h2 className="text-xl font-semibold text-stone-800 mb-4">{selected.title}</h2>
                <div className="prose prose-stone prose-sm max-w-none">
                  <ReactMarkdown>{selected.content || ''}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-stone-200 text-center text-stone-400">
                <p>选择左侧的内容查看详情</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
