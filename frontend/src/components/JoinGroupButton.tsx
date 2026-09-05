import { useState } from 'react';

export default function JoinGroupButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 悬浮进群按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-teal-500 text-white px-4 py-2.5 rounded-full shadow-lg shadow-teal-200 hover:bg-teal-600 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border-0"
        aria-label="加入交流群"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        <span className="text-sm font-bold">进群</span>
      </button>

      {/* 进群弹窗 */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brown-900">加入交流群</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer text-2xl leading-none">&times;</button>
            </div>

            <p className="text-sm text-gray-500 mb-4">扫码添加开发者微信，邀请你进交流群</p>
            <img
              src="/wechat-contact.jpg"
              alt="开发者微信二维码"
              className="w-52 h-52 object-contain mx-auto rounded-2xl border border-orange-100"
            />
            <p className="text-xs text-gray-400 mt-4">添加时备注「勇气工坊」</p>
          </div>
        </div>
      )}
    </>
  );
}
