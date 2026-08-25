import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';
import type { Resource } from '../types';

const TYPE_LABEL: Record<string, string> = {
  concept: '核心概念',
  book: '推荐阅读',
  article: '实践指南',
  practice: '实践指南',
  quote: '经典引述',
  bio: '阿德勒生平',
};

const TYPE_BADGE: Record<string, string> = {
  concept: 'bg-peach-500/90',
  book: 'bg-teal-500/90',
  article: 'bg-purple-400/90',
  practice: 'bg-purple-400/90',
  quote: 'bg-pink-400/90',
  bio: 'bg-orange-400/90',
};

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchResource = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get<Resource>(`/resources/${id}`);
      setResource(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchResource();
  }, [fetchResource]);

  if (loading) {
    return <div className="text-center py-16 text-gray-400">加载中...</div>;
  }

  if (error || !resource) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">文章不存在或加载失败</p>
        <button
          onClick={() => navigate('/knowledge-base')}
          className="px-5 py-2 bg-peach-500 text-white rounded-xl text-sm font-bold border-0 cursor-pointer hover:bg-peach-600"
        >
          返回理论探索
        </button>
      </div>
    );
  }

  const label = TYPE_LABEL[resource.type] || '推荐阅读';
  const badge = TYPE_BADGE[resource.type] || 'bg-orange-400/90';

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/knowledge-base')}
        className="text-sm text-gray-400 hover:text-peach-700 bg-transparent border-0 cursor-pointer mb-4"
      >
        &larr; 返回理论探索
      </button>

      <article className="bg-white p-8 rounded-3xl border border-orange-50 shadow-sm">
        <span className={`${badge} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
          {label}
        </span>
        <h1 className="text-3xl font-bold text-brown-900 mt-4 mb-4">{resource.title}</h1>
        {resource.description && (
          <p className="text-gray-500 leading-relaxed mb-8">{resource.description}</p>
        )}
        <div className="prose prose-stone prose-sm max-w-none">
          <ReactMarkdown>{resource.content || ''}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
