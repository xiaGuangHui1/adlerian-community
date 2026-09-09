import { useCallback, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../lib/api';
import Skeleton from '../components/Skeleton';
import { InterestCircle, CirclePost, Author, PageResponse } from '../types';
import { useAuth } from '../hooks/useAuth';

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

interface CircleComment {
  id: number;
  content: string;
  author: Author;
  parentId?: number;
  createdAt: string;
  replies: CircleComment[];
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString('en-US');
}

function CommentItem({ comment, onReply, selectedId, onCancelReply, onSubmitReply, replyContent, onReplyContentChange, submitting }: {
  comment: CircleComment;
  onReply: (id: number) => void;
  selectedId: number | null;
  onCancelReply: () => void;
  onSubmitReply: (parentId: number) => void;
  replyContent: string;
  onReplyContentChange: (v: string) => void;
  submitting: boolean;
}) {
  const { user } = useAuth();
  return (
    <div className="pl-4 border-l-2 border-stone-100">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-stone-700">{comment.author.nickname}</span>
        <span className="text-xs text-stone-400">{formatTime(comment.createdAt)}</span>
      </div>
      <p className="text-sm text-stone-600 mb-2">{comment.content}</p>
      {user && (
        <button
          onClick={() => onReply(comment.id)}
          className="text-xs text-stone-400 hover:text-amber-700 transition-colors bg-transparent border-0 cursor-pointer"
        >
          Reply
        </button>
      )}
      {selectedId === comment.id && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={replyContent}
            onChange={(e) => onReplyContentChange(e.target.value)}
            placeholder="Write your reply..."
            className="flex-1 px-2 py-1 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmitReply(comment.id);
              }
            }}
          />
          {submitting ? (
            <span className="text-xs text-stone-400 px-2 py-1">Sending...</span>
          ) : (
            <>
              <button
                onClick={() => onSubmitReply(comment.id)}
                className="text-xs text-white bg-amber-700 border-0 px-2 py-1 rounded cursor-pointer"
              >
                Send
              </button>
              <button
                onClick={onCancelReply}
                className="text-xs text-stone-400 bg-transparent border-0 px-2 py-1 rounded cursor-pointer"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
      {comment.replies?.map((reply) => (
        <div key={reply.id} className="mt-2">
          <CommentItem
            comment={reply}
            onReply={onReply}
            selectedId={selectedId}
            onCancelReply={onCancelReply}
            onSubmitReply={onSubmitReply}
            replyContent={replyContent}
            onReplyContentChange={onReplyContentChange}
            submitting={submitting}
          />
        </div>
      ))}
    </div>
  );
}

export default function CircleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [circle, setCircle] = useState<InterestCircle | null>(null);
  const [posts, setPosts] = useState<CirclePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Expanded post state
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [comments, setComments] = useState<CircleComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Reply state
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Top-level comment
  const [topComment, setTopComment] = useState('');
  const [topCommentSubmitting, setTopCommentSubmitting] = useState(false);

  const commentInputRef = useRef<HTMLInputElement>(null);

  const fetchCircle = useCallback(async () => {
    try {
      const { data } = await api.get<InterestCircle>(`/circles/${id}`);
      setCircle(data);
    } catch {
      // handle error
    }
  }, [id]);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await api.get<PageResponse<CirclePost>>(`/circles/${id}/posts`);
      setPosts(data.content);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchCircle();
      void fetchPosts();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchCircle, fetchPosts]);

  const fetchComments = async (postId: number) => {
    setCommentsLoading(true);
    try {
      const { data } = await api.get<CircleComment[]>(`/circles/${id}/posts/${postId}/comments`);
      setComments(data);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostClick = (postId: number) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      setComments([]);
      setReplyTo(null);
      setReplyContent('');
      setTopComment('');
    } else {
      setExpandedPost(postId);
      void fetchComments(postId);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/circles/${id}/posts`, { title, content });
      setShowForm(false);
      setTitle('');
      setContent('');
      await fetchPosts();
      await fetchCircle();
    } catch (error: unknown) {
      alert('Failed to post: ' + getErrorMessage(error, 'Please sign in'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async () => {
    try {
      await api.post(`/circles/${id}/join`);
      await fetchCircle();
    } catch (error: unknown) {
      alert('Failed to join: ' + getErrorMessage(error, 'Please sign in'));
    }
  };

  const handleLeave = async () => {
    try {
      await api.post(`/circles/${id}/leave`);
      await fetchCircle();
    } catch (error: unknown) {
      alert('Failed to leave: ' + getErrorMessage(error, 'Please try again later'));
    }
  };

  const handleTopComment = async (postId: number) => {
    if (!topComment.trim()) return;
    setTopCommentSubmitting(true);
    try {
      await api.post(`/circles/${id}/posts/${postId}/comments`, { content: topComment });
      setTopComment('');
      await fetchComments(postId);
      await fetchPosts();
    } catch (error: unknown) {
      alert('Failed to share: ' + getErrorMessage(error, 'Please sign in'));
    } finally {
      setTopCommentSubmitting(false);
    }
  };

  const handleReply = async (postId: number, parentId: number) => {
    if (!replyContent.trim()) return;
    setReplySubmitting(true);
    try {
      await api.post(`/circles/${id}/posts/${postId}/comments`, {
        content: replyContent,
        parentId,
      });
      setReplyContent('');
      setReplyTo(null);
      await fetchComments(postId);
    } catch (error: unknown) {
      alert('Failed to reply: ' + getErrorMessage(error, 'Please sign in'));
    } finally {
      setReplySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <Skeleton className="h-4 w-24 mb-4" />
        <div className="bg-white p-6 rounded-xl border border-orange-50 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!circle) {
    return <div className="text-center py-12 text-stone-400">Circle not found</div>;
  }

  return (
    <div>
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/circles')}
        className="text-sm text-stone-500 hover:text-amber-700 transition-colors bg-transparent border-0 cursor-pointer mb-4"
      >
        ← Back to circles
      </button>

      {/* 圈子头部 */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{circle.icon || '💬'}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-stone-800">{circle.name}</h1>
            {circle.description && (
              <p className="text-sm text-stone-500 mt-1">{circle.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-stone-400">{circle.memberCount} members</span>
              <span className="text-sm text-stone-400">{circle.postCount} posts</span>
            </div>
          </div>
          {user && (
            circle.joined ? (
              <button
                onClick={handleLeave}
                className="px-4 py-2 text-sm text-stone-500 border border-stone-200 bg-white rounded-lg cursor-pointer hover:bg-stone-50"
              >
                Leave
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="px-4 py-2 text-sm text-white bg-amber-700 border-0 rounded-lg cursor-pointer hover:bg-amber-800"
              >
                Join
              </button>
            )
          )}
        </div>
      </div>

      {/* 发帖区域 */}
      {user && circle.joined && (
        <div className="mb-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full px-4 py-3 bg-white border border-dashed border-stone-300 rounded-xl text-sm text-stone-500 hover:border-amber-300 hover:text-amber-700 transition-colors cursor-pointer"
            >
              + New post
            </button>
          ) : (
            <form onSubmit={handleCreatePost} className="bg-white p-6 rounded-xl border border-stone-200 space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Post title"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Share your thoughts..."
                rows={4}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 text-stone-600 bg-transparent border border-stone-200 rounded-lg text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-700 text-white rounded-lg text-sm cursor-pointer border-0 disabled:opacity-50"
                >
                  Publish
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 帖子列表 */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          No posts yet — join the circle to post the first one
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div
                className="p-5 cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-stone-700">{post.author.nickname}</span>
                  <span className="text-xs text-stone-400">{formatTime(post.createdAt)}</span>
                </div>
                <h3 className="text-base font-medium text-stone-800 mb-2">{post.title}</h3>
                {expandedPost !== post.id && (
                  <p className="text-sm text-stone-500 line-clamp-3 whitespace-pre-wrap">{post.content}</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-stone-400">{post.viewCount} views</span>
                  <span className="text-xs text-stone-400">{post.commentCount} shares</span>
                </div>
              </div>

              {/* 展开的帖子和分享 */}
              {expandedPost === post.id && (
                <div className="border-t border-stone-100">
                  <div className="p-5">
                    <p className="text-sm text-stone-700 whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* 分享区域 */}
                  <div className="border-t border-stone-100 px-5 py-4">
                    <h4 className="text-sm font-medium text-stone-700 mb-3">Shares</h4>

                    {/* 顶级分享输入框 */}
                    {user && (
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={topComment}
                          onChange={(e) => setTopComment(e.target.value)}
                          placeholder="Write your share..."
                          className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                          ref={commentInputRef}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleTopComment(post.id);
                            }
                          }}
                        />
                        {topCommentSubmitting ? (
                          <span className="text-xs text-stone-400 px-3 py-2">Sending...</span>
                        ) : (
                          <button
                            onClick={() => handleTopComment(post.id)}
                            disabled={!topComment.trim()}
                            className="px-4 py-2 bg-amber-700 text-white rounded-lg text-sm cursor-pointer border-0 disabled:opacity-50"
                          >
                            Send
                          </button>
                        )}
                      </div>
                    )}

                    {/* 分享列表 */}
                    {commentsLoading ? (
                      <div className="text-center py-4 text-stone-400 text-sm">Loading shares...</div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-4 text-stone-400 text-sm">No shares yet — post the first one</div>
                    ) : (
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReply={(id) => {
                              setReplyTo(replyTo === id ? null : id);
                              setReplyContent('');
                            }}
                            selectedId={replyTo}
                            onCancelReply={() => {
                              setReplyTo(null);
                              setReplyContent('');
                            }}
                            onSubmitReply={(parentId) => handleReply(post.id, parentId)}
                            replyContent={replyContent}
                            onReplyContentChange={setReplyContent}
                            submitting={replySubmitting}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
