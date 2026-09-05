import { useState } from 'react';
import api from '../lib/api';

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/feedback', { content, contact });
      setSubmitted(true);
      setContent('');
      setContact('');
    } catch {
      alert('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    setOpen(false);
    setSubmitted(false);
  };

  return (
    <>
      {/* 悬浮反馈按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-peach-500 text-white px-4 py-2.5 rounded-full shadow-lg shadow-orange-200 hover:bg-peach-600 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border-0"
        aria-label="反馈"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
        <span className="text-sm font-bold">反馈</span>
      </button>

      {/* 反馈弹窗 */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brown-900">反馈 & 联系我们</h3>
              <button onClick={close} className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer text-2xl leading-none">&times;</button>
            </div>

            {submitted ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-gray-600 font-medium">感谢你的反馈！</p>
                <p className="text-xs text-gray-400 mt-2">你的声音会帮助我们做得更好</p>
              </div>
            ) : (
              <>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  placeholder="写下你的建议、问题或想说的话..."
                  className="w-full px-3 py-2.5 border border-peach-100 rounded-2xl text-sm resize-none focus:outline-none focus:border-peach-400 bg-white"
                />
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  maxLength={100}
                  placeholder="联系方式（微信/邮箱，选填）"
                  className="w-full mt-3 px-3 py-2.5 border border-peach-100 rounded-2xl text-sm focus:outline-none focus:border-peach-400 bg-white"
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !content.trim()}
                  className="w-full mt-4 bg-peach-500 text-white py-2.5 rounded-2xl text-sm font-bold hover:bg-peach-600 transition-colors cursor-pointer border-0 disabled:opacity-50"
                >
                  {submitting ? '提交中...' : '提交反馈'}
                </button>
              </>
            )}

            {/* 加入私聊群 */}
            <div className="mt-6 pt-5 border-t border-orange-50 text-center">
              <p className="text-sm font-bold text-brown-900 mb-1">加入私聊群</p>
              <p className="text-xs text-gray-400 mb-3">扫码添加开发者微信，邀请你进私聊群</p>
              <img
                src="/wechat-contact.jpg"
                alt="开发者微信"
                className="w-40 h-40 object-contain mx-auto rounded-2xl border border-orange-100"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
