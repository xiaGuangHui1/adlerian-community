import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { Quote, Resource } from '../types';

const COVER_STYLES: Record<string, { gradient: string; emoji: string }> = {
  concept: { gradient: 'from-orange-100 via-peach-200 to-amber-200', emoji: '🧠' },
  book: { gradient: 'from-teal-100 via-emerald-100 to-cyan-200', emoji: '📖' },
  article: { gradient: 'from-violet-100 via-purple-100 to-pink-200', emoji: '📝' },
  practice: { gradient: 'from-sky-100 via-indigo-100 to-violet-200', emoji: '🧭' },
  quote: { gradient: 'from-rose-100 via-pink-100 to-orange-200', emoji: '💬' },
  bio: { gradient: 'from-amber-100 via-orange-100 to-rose-200', emoji: '👤' },
};
const DEFAULT_COVER = { gradient: 'from-stone-100 via-orange-100 to-peach-200', emoji: '📚' };

function getCover(type: string) {
  return COVER_STYLES[type] || DEFAULT_COVER;
}

const COVER_IMAGES: Record<string, string[]> = {
  concept: ['/covers/concept-1.jpg', '/covers/concept-2.jpg', '/covers/concept-3.jpg', '/covers/concept-4.jpg'],
  book: ['/covers/book-1.jpg', '/covers/book-2.jpg', '/covers/book-3.jpg'],
  bio: ['/covers/bio-1.jpg', '/covers/bio-2.jpg'],
  practice: ['/covers/practice-1.jpg', '/covers/practice-2.jpg'],
  article: ['/covers/practice-1.jpg', '/covers/practice-2.jpg'],
  quote: ['/covers/concept-1.jpg', '/covers/concept-3.jpg'],
};

function getCoverImage(r: Resource): string {
  const list = COVER_IMAGES[r.type] || COVER_IMAGES.concept;
  return list[r.id % list.length];
}

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [activeTab, setActiveTab] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [hotResources, setHotResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<'latest' | 'hot'>('latest');

  useEffect(() => {
    api.get<Quote>('/quotes/daily')
      .then(r => setQuote(r.data))
      .catch(() => {});
    api.get<Resource[]>('/resources/hot', { params: { limit: 6 } })
      .then(r => setHotResources(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get<Resource[] | { content: Resource[] }>('/resources', { params: { ...(activeTab ? { type: activeTab } : {}) } })
      .then(r => setResources(Array.isArray(r.data) ? r.data : r.data.content || []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const displayedResources = sortMode === 'hot' ? hotResources : resources;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      {/* 头部搜索与分类 */}
      <header className="pt-8 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4">阿德勒心理学知识库</h1>
          <p className="text-gray-500 max-w-2xl mx-auto mb-8">
            "重要的不是被给予了什么，而是如何去利用被给予的东西。" 深入探索阿德勒的核心理论，为你的勇气之旅提供坚实的知识基石。
          </p>
          <div className="max-w-xl mx-auto relative mb-12">
            <input
              className="w-full bg-warm-50 border-none rounded-2xl px-12 py-4 shadow-sm focus:ring-2 focus:ring-peach-500/20 outline-none"
              placeholder="搜索核心概念、引述或书籍..."
              type="text"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-peach-500 text-white px-6 py-2 rounded-xl text-sm font-bold cursor-pointer border-0">搜索</button>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setActiveTab('')}
              className="flex flex-col items-center gap-2 group cursor-pointer border-0 bg-transparent"
            >
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-peach-500 group-hover:bg-peach-500 group-hover:text-white transition-all shadow-sm">
                <svg className="w-8 h-8" viewBox="0 0 256 256" fill="currentColor"><path d="M248,132a56,56,0,0,0-32-51.35V72a8,8,0,0,0-8-8H146.92l31.24-45.66a8,8,0,0,0-2.16-11.18,8.19,8.19,0,0,0-11.18,2.16l-35,51.18A56,56,0,0,0,72,108v17.5a35.42,35.42,0,0,0-24,46.75A35.78,35.78,0,0,0,56,200v24a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V200a36.33,36.33,0,0,0-2.79-14.17A36.6,36.6,0,0,0,120,184a36,36,0,0,0,71.93-7.32A36.41,36.41,0,0,0,184,162.46V152a8,8,0,0,0-8-8H134.4l-28.52,23a8,8,0,0,1-11.18-1.33,8.19,8.19,0,0,1,1.33-11.18L129.75,128H176v14.48A52,52,0,0,0,248,132Z"/></svg>
              </div>
              <span className="text-sm font-medium">核心概念</span>
            </button>
            <button
              onClick={() => setActiveTab('bio')}
              className="flex flex-col items-center gap-2 group cursor-pointer border-0 bg-transparent"
            >
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all shadow-sm">
                <svg className="w-8 h-8" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48H32a8,8,0,0,0-8,8V192a8,8,0,0,0,8,8H224a8,8,0,0,0,8-8V56A8,8,0,0,0,224,48ZM132,144a32,32,0,1,1,32-32A32,32,0,0,1,132,144Zm51.43,40H80.57A24.14,24.14,0,0,1,88,166.36,64.23,64.23,0,0,1,175.53,167,24,24,0,0,1,183.43,184Z"/></svg>
              </div>
              <span className="text-sm font-medium">阿德勒生平</span>
            </button>
            <button
              onClick={() => setActiveTab('quote')}
              className="flex flex-col items-center gap-2 group cursor-pointer border-0 bg-transparent"
            >
              <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-400 group-hover:bg-pink-400 group-hover:text-white transition-all shadow-sm">
                <svg className="w-8 h-8" viewBox="0 0 256 256" fill="currentColor"><path d="M100,56H40A16,16,0,0,0,24,72v64a16,16,0,0,0,16,16h60v56a8,8,0,0,0,16,0V128H56V80H100ZM216,56H156a16,16,0,0,0-16,16v64a16,16,0,0,0,16,16h60v56a8,8,0,0,0,16,0V128H172V80h44Z"/></svg>
              </div>
              <span className="text-sm font-medium">经典引述</span>
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className="flex flex-col items-center gap-2 group cursor-pointer border-0 bg-transparent"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-400 group-hover:text-white transition-all shadow-sm">
                <svg className="w-8 h-8" viewBox="0 0 256 256" fill="currentColor"><path d="M232,48H160a24,24,0,0,0-24,24V192a8,8,0,0,0,8,8h88a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48Zm-8,144H168V72a8,8,0,0,1,8-8h48ZM96,48H24A8,8,0,0,0,16,56V192a8,8,0,0,0,8,8H96a24,24,0,0,0,24-24V72A24,24,0,0,0,96,48Zm8,128a8,8,0,0,1-8,8H32V64H96a8,8,0,0,1,8,8Z"/></svg>
              </div>
              <span className="text-sm font-medium">推荐阅读</span>
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className="flex flex-col items-center gap-2 group cursor-pointer border-0 bg-transparent"
            >
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-purple-400 group-hover:text-white transition-all shadow-sm">
                <svg className="w-8 h-8" viewBox="0 0 256 256" fill="currentColor"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31l83.67-83.66,3.48,13.9-36.8,36.79a8,8,0,0,0,11.31,11.32l40-40a8,8,0,0,0,2.11-7.6l-6.9-27.61L227.31,96A16,16,0,0,0,227.31,73.37ZM192,108.68,147.31,64l24-24L216,84.68Z"/></svg>
              </div>
              <span className="text-sm font-medium">实践指南</span>
            </button>
          </div>
        </div>
      </header>

      {/* 知识列表 */}
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* 文章网格 */}
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">精选文章</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortMode('latest')}
                    className={`text-sm font-bold cursor-pointer border-0 bg-transparent ${sortMode === 'latest' ? 'text-peach-500' : 'text-gray-400 hover:text-peach-500'}`}
                  >
                    最新
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setSortMode('hot')}
                    className={`text-sm cursor-pointer border-0 bg-transparent ${sortMode === 'hot' ? 'text-peach-500 font-bold' : 'text-gray-400 hover:text-peach-500'}`}
                  >
                    最热
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-16 text-gray-400">加载中...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {displayedResources.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => navigate(`/knowledge-base/${r.id}`)}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-orange-50 group cursor-pointer"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${getCover(r.type).gradient} flex items-center justify-center`}>
                          <div className="w-20 h-20 rounded-full bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center text-4xl">
                            {getCover(r.type).emoji}
                          </div>
                        </div>
                        <img
                          alt={r.title}
                          src={r.coverUrl || getCoverImage(r)}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div className="absolute top-4 left-4">
                          <span className={`backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                            r.type === 'concept' ? 'bg-peach-500/90' :
                            r.type === 'book' ? 'bg-teal-500/90' :
                            r.type === 'article' ? 'bg-pink-400/90' :
                            r.type === 'quote' ? 'bg-pink-400/90' :
                            r.type === 'practice' ? 'bg-purple-400/90' :
                            'bg-orange-400/90'
                          }`}>
                            {r.type === 'concept' ? '核心概念' : r.type === 'book' ? '推荐阅读' : r.type === 'article' ? '实践指南' : r.type === 'quote' ? '经典引述' : r.type === 'practice' ? '实践指南' : r.type === 'bio' ? '阿德勒生平' : '推荐阅读'}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold mb-3 text-brown-900 group-hover:text-peach-500 transition-colors">
                          {r.title}
                        </h3>
                        {r.description && (
                          <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">
                            {r.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-gray-400 uppercase font-bold tracking-widest">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm56,112H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48a8,8,0,0,1,0,16Z"/></svg>
                            8 分钟阅读
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61,158.7,48,128,48S61.43,61,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,195,97.3,208,128,208s66.57-13,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-49.85,0-79.09-33.78-89.22-48C48.91,129.78,78.15,96,128,96s79.09,33.78,89.22,48C207.09,158.22,177.85,192,128,192Zm0-80a16,16,0,1,0,16,16A16,16,0,0,0,128,112Z"/></svg>
                            12.5k 阅读
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {displayedResources.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8 col-span-2">暂无内容</p>
                  )}
                </div>
              )}

              {/* 加载更多 */}
              <div className="mt-12 text-center">
                <button className="px-8 py-3 bg-warm-50 text-peach-500 font-bold rounded-2xl border border-orange-100 hover:bg-peach-500 hover:text-white transition-all cursor-pointer">
                  浏览更多知识文章
                </button>
              </div>
            </div>

            {/* 右侧边栏 */}
            <aside className="lg:w-1/3 space-y-8">
              {/* 热门文章排行 */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 256 256"><path d="M240,94c-6.67,0-13,2.11-18.21,5.7C216.71,66.79,189.07,40,155.88,40c-16,0-31.27,7.07-41.55,17.6L128,71.6l-13.67-14C104.15,47.07,88.88,40,72.88,40,43.58,40,19.39,62.94,14.46,93.36A32,32,0,1,0,16,142a33,33,0,0,0-3.42-14.06A16.13,16.13,0,0,1,16,119.8V112h8a24,24,0,0,1,18,9.69,24,24,0,0,1,18-9.69h8v7.8a16.21,16.21,0,0,1,.14,1.55A36.14,36.14,0,0,1,68.55,136H40a16,16,0,0,0,0,32H68.55A36,36,0,1,0,132,128.74V128a8,8,0,0,0-16,0h0c0,1.65-.59,3.17-1,4.74A36,36,0,1,0,179.45,168H216a16,16,0,0,0,0-32h-14.67A36.14,36.14,0,0,1,200.89,120a32,32,0,1,0,39.27-22.16A8,8,0,0,0,240,94Z"/></svg>
                  热门排行
                </h3>
                <div className="space-y-6">
                  {hotResources.slice(0, 4).map((r, i) => (
                    <a
                      key={r.id}
                      href="#"
                      className="flex gap-4 group no-underline cursor-pointer"
                      onClick={(e) => { e.preventDefault(); navigate(`/knowledge-base/${r.id}`); }}
                    >
                      <span className="text-2xl font-black text-orange-100 group-hover:text-peach-500 transition-colors flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-brown-900 group-hover:text-peach-500 transition-colors line-clamp-2">{r.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-1">12,450 人阅读</p>
                      </div>
                    </a>
                  ))}
                  {hotResources.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">暂无排行</p>
                  )}
                </div>
              </div>

              {/* 必读书单 */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 256 256"><path d="M232,48H160a24,24,0,0,0-24,24V192a8,8,0,0,0,8,8h88a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48Zm-8,144H168V72a8,8,0,0,1,8-8h48ZM96,48H24A8,8,0,0,0,16,56V192a8,8,0,0,0,8,8H96a24,24,0,0,0,24-24V72A24,24,0,0,0,96,48Zm8,128a8,8,0,0,1-8,8H32V64H96a8,8,0,0,1,8,8Z"/></svg>
                  必读书单
                </h3>
                <div className="space-y-4">
                  {[
                    { title: '《被讨厌的勇气》', author: '岸见一郎 / 古贺史健', stars: 5 },
                    { title: '《自卑与超越》', author: '阿尔弗雷德·阿德勒', stars: 4 },
                    { title: '《幸福的勇气》', author: '岸见一郎 / 古贺史健', stars: 5 },
                  ].map((book) => (
                    <div key={book.title} className="flex gap-3 p-3 rounded-2xl hover:bg-warm-50 transition-colors cursor-pointer group">
                      <div className="w-12 h-16 rounded-md shadow-sm bg-gradient-to-br from-peach-200 to-teal-200 flex items-center justify-center text-lg flex-shrink-0">
                        📕
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-brown-900 group-hover:text-peach-500 transition-colors">{book.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{book.author}</p>
                        <div className="flex mt-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < book.stars ? 'text-orange-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 256 256"><path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z"/></svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2 text-xs font-bold text-gray-400 border border-dashed border-gray-200 rounded-xl hover:border-peach-500 hover:text-peach-500 transition-all cursor-pointer bg-transparent">
                  查看完整书单
                </button>
              </div>

              {/* 每日引述 - teal 背景卡片 */}
              <div className="bg-teal-500 p-8 rounded-3xl text-white relative overflow-hidden">
                <svg className="absolute -top-4 -left-4 text-white/20 w-20 h-20" fill="currentColor" viewBox="0 0 256 256"><path d="M100,56H40A16,16,0,0,0,24,72v64a16,16,0,0,0,16,16h60V128H40V80H100ZM216,56H156a16,16,0,0,0-16,16v64a16,16,0,0,0,16,16h60V128H156V80h60Z"/></svg>
                <p className="text-lg italic leading-relaxed mb-6 relative z-10">
                  {quote ? `"${quote.content}"` : '"纵使被说坏话、被讨厌，也没什么好在意的，因为对方如何看你，那是对方的课题。"'}
                </p>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full border border-white/30 bg-teal-400 flex items-center justify-center text-white text-xs font-bold">
                    A
                  </div>
                  <span className="text-sm font-bold">
                    —— {quote?.author || '阿尔弗雷德·阿德勒'}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
