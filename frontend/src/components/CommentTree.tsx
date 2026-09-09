import { useState } from 'react';
import { Comment as CommentType, COMMENT_TAGS } from '../types';
import Avatar from './Avatar';
import api from '../lib/api';

const TAG_COLORS: Record<string, string> = {
  'i-experienced-too': 'bg-blue-50 text-blue-600 border-blue-200',
  'helped-me': 'bg-green-50 text-green-600 border-green-200',
  'with-you': 'bg-peach-50 text-peach-600 border-peach-200',
  'inspires-me': 'bg-amber-50 text-amber-600 border-amber-200',
  'i-understand': 'bg-purple-50 text-purple-600 border-purple-200',
};

interface Props {
  comments: CommentType[];
  postId: number;
  onCommentAdded?: () => void;
}

/** 将嵌套回复拍平成单层，并标注每条回复的对象昵称 */
interface FlatReply {
  comment: CommentType;
  replyTo: string;
}
function flattenReplies(replies: CommentType[] | undefined, parentName: string): FlatReply[] {
  const out: FlatReply[] = [];
  const walk = (list: CommentType[] | undefined, replyTo: string) => {
    if (!list) return;
    for (const r of list) {
      out.push({ comment: r, replyTo });
      walk(r.replies, r.author.nickname);
    }
  };
  walk(replies, parentName);
  out.sort(
    (a, b) => new Date(a.comment.createdAt).getTime() - new Date(b.comment.createdAt).getTime()
  );
  return out;
}

function formatTime(s: string) {
  return new Date(s).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TagSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {COMMENT_TAGS.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(value === t.value ? '' : t.value)}
          className={`text-xs px-2 py-1 rounded-full border cursor-pointer transition-colors ${
            value === t.value
              ? `${TAG_COLORS[t.value]} border-current`
              : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function CommentTree({ comments, postId, onCommentAdded }: Props) {
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [replyTarget, setReplyTarget] = useState<CommentType | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyTag, setReplyTag] = useState<string>('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const submitTop = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/posts/${postId}/comments`, { content, tag: tag || null });
      setContent('');
      setTag('');
      onCommentAdded?.();
    } catch {
      alert('Failed to share. Please sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async () => {
    if (!replyContent.trim() || !replyTarget) return;
    setReplySubmitting(true);
    try {
      await api.post(`/posts/${postId}/comments`, {
        content: replyContent,
        parentId: replyTarget.id,
        tag: replyTag || null,
      });
      setReplyContent('');
      setReplyTag('');
      setReplyTarget(null);
      onCommentAdded?.();
    } catch {
      alert('Failed to reply. Please sign in.');
    } finally {
      setReplySubmitting(false);
    }
  };

  const toggleCollapsed = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startReply = (c: CommentType) => {
    setReplyTarget(c);
    setReplyContent('');
    setReplyTag('');
  };

  const renderReplyBox = () => (
    <div className="mt-2 space-y-2">
      <TagSelector value={replyTag} onChange={setReplyTag} />
      <div className="flex gap-2">
        <input
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder={`Reply to @${replyTarget?.author.nickname ?? ''}...`}
          className="flex-1 px-3 py-1.5 border border-peach-100 rounded text-sm focus:outline-none focus:ring-1 focus:ring-peach-400"
        />
        <button
          onClick={submitReply}
          disabled={!replyContent.trim() || replySubmitting}
          className="text-sm text-white bg-peach-500 px-3 py-1.5 rounded cursor-pointer border-0 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* 发起分享 */}
      <div className="mb-5">
        <TagSelector value={tag} onChange={setTag} />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-3 mt-2 border border-peach-100 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-peach-400"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={submitTop}
            disabled={!content.trim() || submitting}
            className="text-sm text-white bg-peach-500 hover:bg-peach-600 px-4 py-2 rounded-lg cursor-pointer border-0 disabled:opacity-50"
          >
            Share
          </button>
        </div>
      </div>

      {/* 楼层列表 */}
      <div className="space-y-3">
        {comments.map((c, i) => {
          const tagInfo = COMMENT_TAGS.find((t) => t.value === c.tag);
          const flatReplies = flattenReplies(c.replies, c.author.nickname);
          const isCollapsed = collapsed.has(c.id);
          return (
            <div key={c.id} className="border border-peach-50 rounded-xl overflow-hidden">
              {/* 楼层主体 */}
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-peach-600 bg-peach-50 px-1.5 py-0.5 rounded">
                    #{i + 1}
                  </span>
                  <Avatar
                    name={c.author.nickname}
                    src={c.author.avatarUrl}
                    userId={c.author.id}
                    className="w-6 h-6"
                    textClassName="text-[10px]"
                  />
                  <span className="text-sm font-medium text-brown-900">{c.author.nickname}</span>
                  {tagInfo && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border ${TAG_COLORS[tagInfo.value] || ''}`}>
                      {tagInfo.label}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">{formatTime(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">{c.content}</p>
                <div className="mt-1.5">
                  <button
                    onClick={() => startReply(c)}
                    className="text-xs text-gray-400 hover:text-peach-700 bg-transparent border-0 cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
                {replyTarget?.id === c.id && renderReplyBox()}
              </div>

              {/* 楼中楼 */}
              {flatReplies.length > 0 && (
                <div className="border-t border-peach-50 bg-warm-50/60 px-3 py-2">
                  <button
                    onClick={() => toggleCollapsed(c.id)}
                    className="text-xs text-gray-400 hover:text-peach-600 bg-transparent border-0 cursor-pointer"
                  >
                    {isCollapsed ? `Show ${flatReplies.length} replies` : 'Hide replies'}
                  </button>
                  {!isCollapsed && (
                    <div className="mt-2 space-y-2.5">
                      {flatReplies.map((r) => (
                        <div key={r.comment.id} className="flex items-start gap-2">
                          <Avatar
                            name={r.comment.author.nickname}
                            src={r.comment.author.avatarUrl}
                            userId={r.comment.author.id}
                            className="w-5 h-5 flex-shrink-0"
                            textClassName="text-[9px]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-medium text-brown-900">
                                {r.comment.author.nickname}
                              </span>
                              {r.replyTo !== r.comment.author.nickname && (
                                <span className="text-xs text-gray-400">
                                  Reply to @{r.replyTo}
                                </span>
                              )}
                              <span className="text-xs text-gray-300">{formatTime(r.comment.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">
                              {r.comment.content}
                            </p>
                            <button
                              onClick={() => startReply(r.comment)}
                              className="text-xs text-gray-400 hover:text-peach-700 bg-transparent border-0 cursor-pointer mt-0.5"
                            >
                              Reply
                            </button>
                            {replyTarget?.id === r.comment.id && renderReplyBox()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">No shares yet — start the first one</p>
        )}
      </div>
    </div>
  );
}
