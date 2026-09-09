import { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';
import Skeleton from '../components/Skeleton';
import Avatar from '../components/Avatar';
import { useAuth } from '../hooks/useAuth';
import { Post, Comment as CommentType, Encouragement, CATEGORIES } from '../types';
import CommentTree from '../components/CommentTree';
import EncourageButton from '../components/EncourageButton';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [encouragements, setEncouragements] = useState<Encouragement[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const isAuthor = profile?.id === post.author.id;

  const startEditing = () => {
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditCategory(post.category);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.put<Post>(`/posts/${id}`, {
        title: editTitle.trim(),
        content: editContent,
        category: editCategory,
      });
      setPost(data);
      setEditing(false);
    } catch {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${id}`);
      navigate('/forum');
    } catch {
      alert('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/forum')}
        className="text-sm text-gray-400 hover:text-peach-700 bg-transparent border-0 cursor-pointer mb-4"
      >
        &larr; Back to Community
      </button>

      {/* 帖子内容 */}
      <article className="bg-white p-6 rounded-xl border border-peach-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-peach-50 text-gray-400 px-2 py-0.5 rounded">
              {getCategoryLabel(post.category)}
            </span>
            {post.source === 'checkin' && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Practice Check-in</span>
            )}
          </div>
          {isAuthor && !editing && (
            <div className="flex items-center gap-2">
              <button
                onClick={startEditing}
                className="text-xs text-peach-600 bg-transparent border border-peach-200 px-3 py-1 rounded cursor-pointer hover:bg-peach-50"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-gray-400 bg-transparent border border-gray-200 px-3 py-1 rounded cursor-pointer hover:text-red-500 hover:border-red-200 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={200}
                className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Content (Markdown supported)</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={12}
                maxLength={20000}
                className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm resize-y font-mono focus:outline-none focus:border-peach-400"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-gray-600 bg-transparent border border-peach-100 rounded-lg text-sm cursor-pointer hover:bg-warm-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editTitle.trim() || !editContent.trim()}
                className="px-4 py-2 bg-peach-500 text-white rounded-lg text-sm cursor-pointer border-0 hover:bg-peach-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-brown-900 mb-3">{post.title}</h1>
            <div className="flex items-center gap-2.5 mb-6 text-sm text-gray-400 flex-wrap">
              <Avatar name={post.author.nickname} src={post.author.avatarUrl} userId={post.author.id} className="w-8 h-8" textClassName="text-xs" />
              <span className="text-gray-600 font-medium">{post.author.nickname}</span>
              <span>·</span>
              <span>{new Date(post.createdAt).toLocaleString('en-US')}</span>
              <span>·</span>
              <span>{post.viewCount} views</span>
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <span>(edited)</span>
              )}
            </div>

            <div className="prose prose-stone prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  table: ({ node: _node, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table {...props} />
                    </div>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            <div className="mt-6 pt-4 border-t border-peach-50">
              <EncourageButton
                targetType="post"
                targetId={post.id}
                encouragements={encouragements}
                onNewEncouragement={(e) => setEncouragements([e, ...encouragements])}
              />
            </div>
          </>
        )}
      </article>

      {/* 分享区 */}
      <div className="mt-6 bg-white p-6 rounded-xl border border-peach-100">
        <h2 className="text-lg font-medium text-brown-900 mb-4">
          Shares ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h2>
        <CommentTree comments={comments} postId={post.id} onCommentAdded={fetchData} />
      </div>
    </div>
  );
}
