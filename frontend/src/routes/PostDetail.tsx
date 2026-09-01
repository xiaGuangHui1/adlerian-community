import { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';
import Skeleton from '../components/Skeleton';
import { Post, Comment as CommentType, Encouragement, CATEGORIES } from '../types';
import CommentTree from '../components/CommentTree';
import EncourageButton from '../components/EncourageButton';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [encouragements, setEncouragements] = useState<Encouragement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const [postRes, commentsRes, encRes] = await Promise.all([
        api.get<Post>(`/posts/${id}`),
        api.get<{ content: CommentType[] }>(`/posts/${id}/comments`),
        api.get<Encouragement[]>(`/encouragements?targetType=post&targetId=${id}`),
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data.content);
      setEncouragements(encRes.data);
    } catch {
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchData]);

  if (loading || !post) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <Skeleton className="h-4 w-24 mb-4" />
        <div className="bg-white p-6 rounded-xl border border-peach-100">
          <Skeleton className="h-5 w-20 mb-4" />
          <Skeleton className="h-7 w-3/4 mb-3" />
          <Skeleton className="h-4 w-1/3 mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  const getCategoryLabel = (value: string) =>
    CATEGORIES.find((c) => c.value === value)?.label || value;

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/forum')}
        className="text-sm text-gray-400 hover:text-peach-700 bg-transparent border-0 cursor-pointer mb-4"
      >
        &larr; 返回社区
      </button>

      {/* 帖子内容 */}
      <article className="bg-white p-6 rounded-xl border border-peach-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-peach-50 text-gray-400 px-2 py-0.5 rounded">
            {getCategoryLabel(post.category)}
          </span>
          {post.source === 'checkin' && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">实践打卡</span>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-brown-900 mb-3">{post.title}</h1>
        <div className="flex items-center gap-3 mb-6 text-sm text-gray-400">
          <span className="text-gray-600">{post.author.nickname}</span>
          <span>{new Date(post.createdAt).toLocaleString('zh-CN')}</span>
        </div>

        <div className="prose prose-stone prose-sm max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="mt-6 pt-4 border-t border-peach-50">
          <EncourageButton
            targetType="post"
            targetId={post.id}
            encouragements={encouragements}
            onNewEncouragement={(e) => setEncouragements([e, ...encouragements])}
          />
        </div>
      </article>

      {/* 评论区 */}
      <div className="mt-6 bg-white p-6 rounded-xl border border-peach-100">
        <h2 className="text-lg font-medium text-brown-900 mb-4">
          评论 ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h2>
        <CommentTree comments={comments} postId={post.id} onCommentAdded={fetchData} />
      </div>
    </div>
  );
}
