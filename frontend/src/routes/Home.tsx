import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { CATEGORIES, type Post, type Resource, type HomeStats } from '../types';
import { getResourceCover, getPostCover } from '../lib/covers';

function timeAgo(time: string) {
  const diff = Date.now() - new Date(time).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

export default function Home() {
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [hotResources, setHotResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsR, postsR, resourcesR] = await Promise.allSettled([
          api.get<HomeStats>('/home/stats'),
          api.get<Post[]>('/posts/hot', { params: { limit: 5 } }),
          api.get<Resource[]>('/resources/hot', { params: { limit: 6 } }),
        ]);

        if (statsR.status === 'fulfilled') setStats(statsR.value.data);
        if (postsR.status === 'fulfilled') setHotPosts(postsR.value.data);
        if (resourcesR.status === 'fulfilled') setHotResources(resourcesR.value.data);
      } catch {
        // gracefully handle errors
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-gray-400 animate-pulse">加载中...</div>
      </div>
    );
  }

  const totalUsers = stats?.totalUsers ?? 0;
  const displayUsers = totalUsers > 0 ? formatNumber(totalUsers) : '12,480';

  return (
    <div className="space-y-0 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* ========== Hero 区域 - 精确匹配 spec ========== */}
      <section className="pt-8 pb-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE4D1 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              被讨厌的勇气，<br /><span className="text-peach-500">从这里开始</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              世界极其简单，人们随时可以获得幸福。这里是阿德勒心理学的社区，让我们一起练习课题分离，找回属于自己的共同体感觉。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/knowledge-base"
                className="bg-peach-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-orange-200 flex items-center justify-center gap-2 no-underline"
              >
                探索阿德勒哲学
              </Link>
              <Link
                to="/checkin"
                className="bg-white text-teal-500 border-2 border-teal-500 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-teal-500 hover:text-white transition-all flex items-center justify-center gap-2 no-underline"
              >
                开启实践之旅
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center md:justify-start gap-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-peach-300 flex items-center justify-center text-white text-xs font-bold">自</div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-teal-400 flex items-center justify-center text-white text-xs font-bold">林</div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-orange-400 flex items-center justify-center text-white text-xs font-bold">勇</div>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                <span className="text-teal-500">{displayUsers}+</span> 位同路人正在这里成长
              </p>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-peach-500/10 rounded-full blur-3xl" />
            <img alt="Warm community illustration" className="relative w-full max-w-md mx-auto rounded-3xl shadow-2xl animate-float" src="https://modao.cc/agent-py/media/generated_images/2026-05-25/1725c93545554abba65aa01647ed9ac6.jpg" />
          </div>
        </div>
      </section>

      {/* ========== 核心价值 — 为什么选择阿德勒心理学社区 ========== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">为什么选择阿德勒心理学社区？</h2>
            <p className="text-gray-500">我们不只是学习理论，更是在生活中实践勇气</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 卡片 1: 共同体感觉 */}
            <div className="p-8 rounded-3xl bg-warm-50 border border-orange-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-peach-500 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 256 256"><path d="M117.18,157.17a60,60,0,1,0-66-19.47A60,60,0,0,0,117.18,157.17ZM28,106a36,36,0,1,1,36,36A36,36,0,0,1,28,106Zm153.82,51.17a60,60,0,1,0-66-19.47A60,60,0,0,0,181.82,157.17ZM124,106a36,36,0,1,1,36,36A36,36,0,0,1,124,106Zm33.13,76.27A96.36,96.36,0,0,0,98.87,160H76.82a120.13,120.13,0,0,1,150.36,22.27A8,8,0,0,1,221,193.34,104.1,104.1,0,0,0,157.13,182.27Z"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">共同体感觉</h3>
              <p className="text-gray-600 leading-relaxed">
                摆脱孤独感，在真诚的互助中建立与他人的深层联结。这里没有评判，只有接纳与理解。
              </p>
            </div>
            {/* 卡片 2: 课题分离 */}
            <div className="p-8 rounded-3xl bg-warm-50 border border-orange-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-teal-500 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 256 256"><path d="M224,96a16,16,0,0,1-16,16H136v48a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V96A16,16,0,0,1,56,80h64a16,16,0,0,1,16,16v48h56V136H176a8,8,0,0,1,0-16h16a8,8,0,0,1,0,16H176v-8h32A16,16,0,0,1,224,96ZM56,96v64h64V96Zm184,0H224v64h16a8,8,0,0,0,0-16Z" opacity="0.2"/><path d="M240,144H176V136h16a8,8,0,0,0,0-16H176V112h16a8,8,0,0,0,0-16H176V80h56v40h-16a8,8,0,0,0,0,16h16v40h-16a8,8,0,0,0,0,16h16a8,8,0,0,0,8-8V88a8,8,0,0,0-8-8H168a8,8,0,0,0-8,8v8H136V40a16,16,0,0,0-16-16H56A16,16,0,0,0,40,40v64a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V80H152v96a8,8,0,0,0,8,8h8v16a8,8,0,0,0,16,0V192h8a16,16,0,0,0,16-16h32a16,16,0,0,0,16-16V144A16,16,0,0,0,240,144ZM120,104H56V40h64Z"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">课题分离</h3>
              <p className="text-gray-600 leading-relaxed">
                学会区分"谁的课题"，把沉重的人际包袱放下。专注于自己能改变的事，获得真正的自由。
              </p>
            </div>
            {/* 卡片 3: 勇气训练 */}
            <div className="p-8 rounded-3xl bg-warm-50 border border-orange-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-orange-400 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 256 256"><path d="M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">勇气训练</h3>
              <p className="text-gray-600 leading-relaxed">
                通过每日微小的实践，培养面对困难和被讨厌的勇气。改变人生，从当下的行动开始。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 热门讨论 ========== */}
      <section className="py-20 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">热门讨论</h2>
              <p className="text-gray-500">听听大家在生活中是如何运用阿德勒哲学的</p>
            </div>
            <Link to="/forum" className="text-peach-500 font-bold flex items-center gap-1 hover:underline no-underline">
              查看全部广场
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in-list">
            {hotPosts.slice(0, 4).map((post) => (
              <Link
                key={post.id}
                to={`/forum/${post.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-orange-50 no-underline block"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    alt={post.title}
                    src={getPostCover(post.category)}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-white/85 backdrop-blur-sm text-peach-700 text-xs font-bold px-3 py-1 rounded-full">
                    {CATEGORIES.find((c) => c.value === post.category)?.label || post.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-peach-300 to-teal-300 flex items-center justify-center text-white text-xs font-bold">
                      {post.author.nickname.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{post.author.nickname}</p>
                      <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-brown-900 hover:text-peach-500 transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {post.content.replace(/[#*`]/g, '').substring(0, 120)}
                  </p>
                  <div className="flex items-center gap-4 text-gray-400 text-xs">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      {post.commentCount} 回复
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                      {post.encouragementCount} 点赞
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {hotPosts.length === 0 && (
              <div className="text-center py-12 text-gray-400 col-span-2">
                暂无讨论，去发表第一个话题吧
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== 知识精选 ========== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">知识精选</h2>
            <p className="text-gray-500">深入浅出，系统掌握阿德勒心理学核心概念</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 fade-in-list">
            {hotResources.slice(0, 3).map((r) => (
              <Link key={r.id} to="/knowledge-base" className="group cursor-pointer no-underline block hover:-translate-y-1 transition-all duration-300">
                <div className="relative rounded-3xl overflow-hidden mb-6 aspect-video">
                  <div className="absolute inset-0 bg-gradient-to-br from-peach-200 to-teal-200 flex items-center justify-center text-4xl">
                    {r.type === 'book' ? '📖' : r.type === 'concept' ? '🧠' : r.type === 'article' ? '📄' : '📚'}
                  </div>
                  <img
                    alt={r.title}
                    src={r.coverUrl || getResourceCover(r)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <span className={`text-white text-xs px-3 py-1 rounded-full ${
                      r.type === 'concept' ? 'bg-peach-500' :
                      r.type === 'book' ? 'bg-teal-500' :
                      r.type === 'article' ? 'bg-pink-400' :
                      'bg-orange-400'
                    }`}>
                      {r.type === 'concept' ? '核心概念' : r.type === 'book' ? '推荐阅读' : r.type === 'article' ? '实践指南' : '学习路径'}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-brown-900 group-hover:text-peach-500 transition-colors">{r.title}</h3>
                {r.description && (
                  <p className="text-gray-500 text-sm line-clamp-2">{r.description}</p>
                )}
              </Link>
            ))}
            {hotResources.length === 0 && (
              <div className="text-center py-12 text-gray-400 col-span-3">知识库建设中</div>
            )}
          </div>
        </div>
      </section>

      {/* ========== 今日打卡动态 — marquee 跑马灯 ========== */}
      <section className="py-12 bg-teal-500/5 overflow-hidden">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-teal-500/10">
            <div className="w-8 h-8 rounded-full bg-peach-300 flex items-center justify-center text-white text-xs">小</div>
            <span className="text-sm font-medium"><span className="text-teal-500 font-bold">小张</span> 完成了"接纳不完美的自己" Day 7</span>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-teal-500/10">
            <div className="w-8 h-8 rounded-full bg-teal-400 flex items-center justify-center text-white text-xs">阿</div>
            <span className="text-sm font-medium"><span className="text-teal-500 font-bold">阿木</span> 实践了"课题分离"：拒绝了无理加班</span>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-teal-500/10">
            <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs">静</div>
            <span className="text-sm font-medium"><span className="text-teal-500 font-bold">静静</span> 完成了"对陌生人微笑"挑战</span>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-teal-500/10">
            <div className="w-8 h-8 rounded-full bg-peach-400 flex items-center justify-center text-white text-xs">勇</div>
            <span className="text-sm font-medium"><span className="text-teal-500 font-bold">勇者</span> 连续打卡 30 天：获得"勇气先锋"勋章</span>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-teal-500/10">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs">L</div>
            <span className="text-sm font-medium"><span className="text-teal-500 font-bold">Lily</span> 分享了：今天我对自己说了一句谢谢</span>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
          width: max-content;
        }
      `}</style>
    </div>
  );
}
