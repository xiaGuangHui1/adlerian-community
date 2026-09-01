import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { Post, CATEGORIES, PageResponse } from '../types';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

export default function Forum() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), size: '20' });
        if (category) params.set('category', category);
        const { data } = await api.get<PageResponse<Post>>(`/posts?${params}`);
        setPosts(data.content);
        setTotalPages(data.totalPages);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };

    void fetchPosts();
  }, [category, page]);

  const getCategoryLabel = (value: string) =>
    CATEGORIES.find((c) => c.value === value)?.label || value;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      {/* 论坛头部 */}
      <header className="pt-8 pb-10 bg-white border-b border-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">同行广场</h1>
              <p className="text-gray-500">在这里，每一个声音都值得被聆听，每一份勇气都值得被鼓励。</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-grow md:w-64">
                <input
                  className="w-full bg-warm-50 border-none rounded-2xl px-10 py-3 text-sm focus:ring-2 focus:ring-peach-500/20 outline-none"
                  placeholder="搜索帖子或话题..."
                  type="text"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <Link
                to="/forum/new"
                className="bg-peach-500 text-white p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-100 flex items-center gap-2 px-6 no-underline"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                <span className="font-bold">发帖</span>
              </Link>
            </div>
          </div>
          {/* 分类标签 */}
          <div className="flex flex-wrap gap-2 mt-8">
            <button
              onClick={() => { setCategory(''); setPage(0); setSearchParams({}); }}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer border-0 active:scale-95 ${
                !category ? 'bg-peach-500 text-white shadow-sm' : 'bg-warm-50 text-gray-600 hover:bg-orange-100'
              }`}
            >
              全部
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => { setCategory(c.value); setPage(0); setSearchParams({ category: c.value }); }}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer border-0 active:scale-95 ${
                  category === c.value ? 'bg-peach-500 text-white shadow-sm' : 'bg-warm-50 text-gray-600 hover:bg-orange-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 论坛主内容区 */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 左侧帖子列表 */}
            <div className="lg:w-2/3 space-y-4 fade-in-list">
              {loading ? (
                <div className="text-center py-12 text-gray-400">加载中...</div>
              ) : (
                <>
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/forum/${post.id}`}
                      className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-orange-50 block no-underline group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border-2 border-orange-100 bg-gradient-to-br from-peach-300 to-teal-300 flex items-center justify-center text-white font-bold text-sm">
                            {post.author.nickname.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{post.author.nickname}</h4>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
                              <span>{timeAgo(post.createdAt)} · <span className="text-teal-500 font-medium">{getCategoryLabel(post.category)}</span></span>
                              {post.source === 'checkin' && (
                                <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">实践打卡</span>
                              )}
                            </p>
                          </div>
                        </div>
                        {post.pinned && (
                          <span className="text-xs bg-peach-100 text-peach-700 px-2 py-1 rounded">置顶</span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold mb-3 text-brown-900 group-hover:text-peach-500 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed text-sm mb-6 line-clamp-3">
                        {post.content.replace(/[#*`]/g, '').substring(0, 200)}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                            <span>{post.encouragementCount}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                            <span>{post.commentCount}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            <span>{post.viewCount || 0}</span>
                          </div>
                        </div>
                        {post.encouragementCount > 100 && (
                          <span className="text-xs text-orange-400">热门讨论中</span>
                        )}
                      </div>
                    </Link>
                  ))}
                  {posts.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      暂无帖子，来发起第一个讨论吧
                    </div>
                  )}
                </>
              )}

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex justify-center pt-8">
                  <nav className="flex items-center gap-2">
                    {page > 0 && (
                      <button
                        onClick={() => setPage(page - 1)}
                        className="w-10 h-10 rounded-xl bg-white border border-orange-100 flex items-center justify-center text-gray-400 hover:bg-peach-500 hover:text-white transition-all cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/></svg>
                      </button>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all cursor-pointer border-0 ${
                          page === i ? 'bg-peach-500 text-white' : 'bg-white border border-orange-100 text-gray-600 hover:bg-orange-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    {page < totalPages - 1 && (
                      <button
                        onClick={() => setPage(page + 1)}
                        className="w-10 h-10 rounded-xl bg-white border border-orange-100 flex items-center justify-center text-gray-400 hover:bg-peach-500 hover:text-white transition-all cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/></svg>
                      </button>
                    )}
                  </nav>
                </div>
              )}
            </div>

            {/* 右侧边栏 */}
            <aside className="lg:w-1/3 space-y-8">
              {/* 社区统计 */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-peach-500" fill="currentColor" viewBox="0 0 256 256"><path d="M216,216H40a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H72V56a8,8,0,0,1,8-8h32V40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8h32a8,8,0,0,1,8,8v32h8a8,8,0,0,1,8,8v72A56,56,0,0,1,168,216Zm0-16a40,40,0,0,0,40-40V88h-40ZM128,48H88v8h40Zm-56,16v8h40V80h8V64h40v56h-8V80H120v24H88V80H72Zm80,72h-64v16h64Zm-64,16v16h64V152Z"/></svg>
                  社区动态
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-warm-50 p-4 rounded-2xl text-center">
                    <p className="text-2xl font-bold text-peach-500">12.4k</p>
                    <p className="text-xs text-gray-500 mt-1">成员</p>
                  </div>
                  <div className="bg-warm-50 p-4 rounded-2xl text-center">
                    <p className="text-2xl font-bold text-teal-500">856</p>
                    <p className="text-xs text-gray-500 mt-1">今日发帖</p>
                  </div>
                  <div className="bg-warm-50 p-4 rounded-2xl text-center">
                    <p className="text-2xl font-bold text-orange-400">3.2k</p>
                    <p className="text-xs text-gray-500 mt-1">在线勇气</p>
                  </div>
                  <div className="bg-warm-50 p-4 rounded-2xl text-center">
                    <p className="text-2xl font-bold text-blue-400">99%</p>
                    <p className="text-xs text-gray-500 mt-1">互助率</p>
                  </div>
                </div>
              </div>

              {/* 热门话题 */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-peach-500" fill="currentColor" viewBox="0 0 256 256"><path d="M224,88H175.73L194,57.55A8,8,0,0,0,187.73,46.39l-80,72A8,8,0,0,0,112,132h48.27L142,162.45a8,8,0,0,0,6.27,11.16l80,72A8,8,0,0,0,240,240V96A8,8,0,0,0,224,88Z"/></svg>
                  热门话题
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    '# 课题分离实践', '# 被讨厌的勇气', '# 共同体感觉',
                    '# 目的论', '# 自我接纳', '# 幸福的勇气',
                  ].map((tag) => (
                    <button
                      key={tag}
                      className="px-4 py-2 bg-warm-50 rounded-xl text-sm text-gray-600 hover:bg-peach-500 hover:text-white transition-all cursor-pointer border-0"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 大家之友 */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 256 256"><path d="M243.84,76.19a12,12,0,0,0-13.47-2.1l-50.63,23-50-40.71a12,12,0,0,0-15-.24l-52,40a12,12,0,0,0-1.29,17.63l14.7,18.87L24.23,170.9a12,12,0,0,0,2.93,17.48l28.68,19.1a12,12,0,0,0,17-3.44l30.16-47.25,13.27,10.84a12,12,0,0,0,17.16-1.47l24-28A12,12,0,0,0,160,120c-0.12,0-.24,0-0.36,0L116.81,115,95,151.75,60,121.72l65.33-49.73,39.19,31.91L114.76,127c-4.11,2-7.67,5.09-10.27,8.83l-15,17.5L108,130.78l23.4-10.63a12,12,0,0,0,6.83-14.34L127.48,72.47l56.83,26.71a12,12,0,0,0,15-2.45L243.12,51.8A12,12,0,0,0,243.84,76.19Z"/></svg>
                  大家之友
                </h3>
                <div className="space-y-4">
                  {[
                    { name: '自由之翼', score: '12,450' },
                    { name: '阿德勒学徒', score: '10,230' },
                    { name: '林间漫步', score: '9,840' },
                  ].map((user, i) => (
                    <div key={user.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-peach-300 to-teal-300 flex items-center justify-center text-white text-xs font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white ${
                            i === 0 ? 'bg-orange-400' : i === 1 ? 'bg-gray-400' : 'bg-brown-900'
                          }`}>
                            {i + 1}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold">{user.name}</p>
                          <p className="text-[10px] text-gray-400">贡献值 {user.score}</p>
                        </div>
                      </div>
                      <button className="text-xs text-peach-500 font-bold hover:underline bg-transparent border-0 cursor-pointer">关注</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 社区公约 */}
              <div className="bg-gradient-to-br from-peach-500 to-orange-300 p-6 rounded-3xl text-white shadow-lg shadow-orange-100 relative overflow-hidden group">
                <svg className="absolute -right-4 -bottom-4 text-white/20 group-hover:scale-110 transition-transform w-[120px] h-[120px]" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/></svg>
                <h4 className="font-bold text-lg mb-2 relative z-10">社区公约</h4>
                <p className="text-sm text-white/90 mb-4 relative z-10">
                  这里是一个安全、包容的互助空间。请遵守"不批评、不建议、不评判"的原则，用同理心去倾听。
                </p>
                <button className="inline-block bg-white text-peach-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-warm-50 transition-colors relative z-10 border-0 cursor-pointer">
                  了解更多
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
