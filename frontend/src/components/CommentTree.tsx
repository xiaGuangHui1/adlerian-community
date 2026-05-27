import { useState } from 'react';
import { Comment as CommentType, Encouragement } from '../types';
import EncourageButton from './EncourageButton';
import api from '../lib/api';

interface Props {
  comments: CommentType[];
  postId: number;
  onCommentAdded?: () => void;
}

function CommentItem({ comment, postId, depth = 0, onCommentAdded }: {
  comment: CommentType;
  postId: number;
  depth?: number;
  onCommentAdded?: () => void;
}) {
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [encouragements, setEncouragements] = useState<Encouragement[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/posts/${postId}/comments`, {
        content: replyContent,
        parentId: comment.id,
      });
      setReplyContent('');
      setReplying(false);
      onCommentAdded?.();
    } catch {
      alert('回复失败，请确认已登录');
    } finally {
      setSubmitting(false);
    }
  };

  const timeStr = new Date(comment.createdAt).toLocaleString('zh-CN');

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-peach-50 pl-4' : ''}`}>
      <div className="py-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-brown-900">{comment.author.nickname}</span>
          <span className="text-xs text-gray-400">{timeStr}</span>
        </div>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{comment.content}</p>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => setReplying(!replying)}
            className="text-xs text-gray-400 hover:text-peach-700 bg-transparent border-0 cursor-pointer"
          >
            回复
          </button>
          <EncourageButton
            targetType="comment"
            targetId={comment.id}
            encouragements={encouragements}
            onNewEncouragement={(e) => setEncouragements([e, ...encouragements])}
          />
        </div>

        {replying && (
          <div className="mt-2 flex gap-2">
            <input
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="写下你的回复..."
              className="flex-1 px-3 py-1.5 border border-peach-100 rounded text-sm focus:outline-none focus:ring-1 focus:ring-peach-400"
            />
            <button
              onClick={handleReply}
              disabled={submitting}
              className="text-sm text-white bg-peach-500 px-3 py-1.5 rounded cursor-pointer border-0 disabled:opacity-50"
            >
              发送
            </button>
          </div>
        )}
      </div>

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          depth={depth + 1}
          onCommentAdded={onCommentAdded}
        />
      ))}
    </div>
  );
}

export default function CommentTree({ comments, postId, onCommentAdded }: Props) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/posts/${postId}/comments`, { content });
      setContent('');
      onCommentAdded?.();
    } catch {
      alert('评论失败，请确认已登录');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* 发表评论 */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你的想法..."
          className="w-full p-3 border border-peach-100 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-peach-400"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="text-sm text-white bg-peach-500 hover:bg-peach-600 px-4 py-2 rounded-lg cursor-pointer border-0 disabled:opacity-50"
          >
            发表评论
          </button>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="divide-y divide-peach-50">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
            onCommentAdded={onCommentAdded}
          />
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">暂无评论，来分享你的想法吧</p>
        )}
      </div>
    </div>
  );
}
