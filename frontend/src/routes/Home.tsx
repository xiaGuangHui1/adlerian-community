import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { CATEGORIES, type Post, type Resource, type HomeStats, type Author, type PageResponse } from '../types';
import { getResourceCover } from '../lib/covers';
import Avatar from '../components/Avatar';
import { Icon } from '@iconify-icon/react';

function timeAgo(time: string) {
  const diff = Date.now() - new Date(time).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function PostSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-orange-50 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
      <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
      <div className="h-4 bg-gray-100 rounded w-full mb-2" />
      <div className="h-4 bg-gray-100 rounded w-5/6" />
    </div>
  );
}

function ResourceSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-gray-100 rounded-3xl mb-6" />
      <div className="h-6 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-full" />
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [hotResources, setHotResources] = useState<Resource[]>([]);
  const [recentPosters, setRecentPosters] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsR, postsR, resourcesR, recentR] = await Promise.allSettled([
          api.get<HomeStats>('/home/stats'),
          api.get<Post[]>('/posts/hot', { params: { limit: 5 } }),
          api.get<Resource[]>('/resources/hot', { params: { limit: 6 } }),
          api.get<PageResponse<Post>>('/posts', { params: { page: 0, size: 10 } }),
        ]);

        if (statsR.status === 'fulfilled') setStats(statsR.value.data);
        if (postsR.status === 'fulfilled') setHotPosts(postsR.value.data);
        if (resourcesR.status === 'fulfilled') setHotResources(resourcesR.value.data);
        if (recentR.status === 'fulfilled') {
          const seen = new Set<string>();
          const authors: Author[] = [];
          for (const p of recentR.value.data.content) {
            if (!seen.has(p.author.id)) {
              seen.add(p.author.id);
              authors.push(p.author);
              if (authors.length >= 3) break;
            }
          }
          setRecentPosters(authors);
        }
      } catch {
        // gracefully handle errors
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const totalUsers = stats?.totalUsers ?? 0;
  const displayUsers = totalUsers > 0 ? formatNumber(totalUsers) : '12,480';

  return (
    <div className="space-y-0 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* ========== Hero 区域 - 精确匹配 spec ========== */}
      <section className="pt-8 pb-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE4D1 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              The courage to be disliked,<br /><span className="text-peach-500">starts here</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              The world is simple, and happiness is within everyone's reach. This is an Adlerian psychology community — let's practice separation of tasks and reclaim our sense of belonging.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/knowledge-base"
                className="bg-peach-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-orange-200 flex items-center justify-center gap-2 no-underline"
              >
                Explore Adler's Philosophy
              </Link>
              <Link
                to="/checkin"
                className="bg-white text-teal-500 border-2 border-teal-500 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-teal-500 hover:text-white transition-all flex items-center justify-center gap-2 no-underline"
              >
                Start Your Practice
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center md:justify-start gap-4">
              <div className="flex -space-x-2">
                {recentPosters.length > 0 ? (
                  recentPosters.map((a) => (
                    <Avatar key={a.id} name={a.nickname} src={a.avatarUrl} className="w-10 h-10 border-2 border-white" textClassName="text-xs" />
                  ))
                ) : (
                  <>
                    <img alt="fellow member" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="/covers/avatar-1.jpg" />
                    <img alt="fellow member" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="/covers/avatar-2.jpg" />
                    <img alt="fellow member" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="/covers/avatar-3.jpg" />
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 font-medium">
                <span className="text-teal-500">{displayUsers}+</span> members growing here
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
            <h2 className="text-3xl font-bold mb-4">Why Adlerian Community?</h2>
            <p className="text-gray-500">We don't just learn theory — we practice courage in daily life</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 卡片 1: 共同体感觉 */}
            <div className="p-8 rounded-3xl bg-warm-50 border border-orange-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-peach-500 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Icon icon="ph:users-three" width="32" height="32" />
              </div>
              <h3 className="text-xl font-bold mb-4">Sense of Belonging</h3>
              <p className="text-gray-600 leading-relaxed">
                Escape loneliness and build deep connections through genuine mutual support. No judgment here — only acceptance and understanding.
              </p>
            </div>
            {/* 卡片 2: 课题分离 */}
            <div className="p-8 rounded-3xl bg-warm-50 border border-orange-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-teal-500 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Icon icon="ph:split-horizontal" width="32" height="32" />
              </div>
              <h3 className="text-xl font-bold mb-4">Separation of Tasks</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn to separate "whose task is whose", and set down heavy relationship baggage. Focus on what you can change and find true freedom.
              </p>
            </div>
            {/* 卡片 3: 勇气训练 */}
            <div className="p-8 rounded-3xl bg-warm-50 border border-orange-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-orange-400 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 256 256"><path d="M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Courage Practice</h3>
              <p className="text-gray-600 leading-relaxed">
                Build the courage to face difficulty and being disliked through small daily actions. Change your life — start with the next step you take.
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
              <h2 className="text-3xl font-bold mb-2">Popular Discussions</h2>
              <p className="text-gray-500">See how people apply Adler's philosophy in daily life</p>
            </div>
            <Link to="/forum" className="text-peach-500 font-bold flex items-center gap-1 hover:underline no-underline">
              View All
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in-list">
            {loading ? Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />) : hotPosts.slice(0, 4).map((post) => (
              <Link
                key={post.id}
                to={`/forum/${post.id}`}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-orange-50 no-underline block"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={post.author.nickname} src={post.author.avatarUrl} userId={post.author.id} className="w-10 h-10" textClassName="text-xs" />
                  <div>
                    <p className="font-bold text-sm text-gray-800">{post.author.nickname}</p>
                    <p className="text-xs text-gray-400">
                      {timeAgo(post.createdAt)} · {CATEGORIES.find((c) => c.value === post.category)?.label || post.category}
                    </p>
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
                    {post.commentCount} replies
                  </span>
                  <span className="flex items-center gap-1">
                    {post.encouragementCount} thanks
                  </span>
                </div>
              </Link>
            ))}
            {!loading && hotPosts.length === 0 && (
              <div className="text-center py-12 text-gray-400 col-span-2">
                No discussions yet — start the first one
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== 知识精选 ========== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Featured Knowledge</h2>
            <p className="text-gray-500">Master Adlerian psychology concepts, simply and systematically</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 fade-in-list">
            {loading ? Array.from({ length: 3 }).map((_, i) => <ResourceSkeleton key={i} />) : hotResources.slice(0, 3).map((r) => (
              <Link key={r.id} to={`/knowledge-base/${r.id}`} className="group cursor-pointer no-underline block hover:-translate-y-1 transition-all duration-300">
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
                      {r.type === 'concept' ? 'Core Concept' : r.type === 'book' ? 'Books' : r.type === 'article' ? 'Practice Guide' : 'Learning Path'}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-brown-900 group-hover:text-peach-500 transition-colors">{r.title}</h3>
                {r.description && (
                  <p className="text-gray-500 text-sm line-clamp-2">{r.description}</p>
                )}
              </Link>
            ))}
            {!loading && hotResources.length === 0 && (
              <div className="text-center py-12 text-gray-400 col-span-3">Knowledge base coming soon</div>
            )}
          </div>
        </div>
      </section>

      {/* ========== 今日打卡动态 — marquee 跑马灯 ========== */}
      <section className="py-12 bg-teal-500/5 overflow-hidden">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-teal-500/10">
            <div className="w-8 h-8 rounded-full bg-peach-300 flex items-center justify-center text-white text-xs">Z</div>
            <span className="text-sm font-medium"><span className="text-teal-500 font-bold">Zhang</span> completed "Accepting My Imperfect Self" Day 7</span>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-teal-500/10">
            <div className="w-8 h-8 rounded-full bg-teal-400 flex items-center justify-center text-white text-xs">M</div>
            <span className="text-sm font-medium"><span className="text-teal-500 font-bold">Mu</span> practiced "Separation of Tasks" — said no to overtime</span>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-teal-500/10">
            <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs">J</div>
            <span className="text-sm font-medium"><span className="text-teal-500 font-bold">Jing</span> completed the "Smile at a Stranger" challenge</span>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-teal-500/10">
            <div className="w-8 h-8 rounded-full bg-peach-400 flex items-center justify-center text-white text-xs">Y</div>
            <span className="text-sm font-medium"><span className="text-teal-500 font-bold">Yong</span> checked in 30 days in a row and earned the "Courage Pioneer" badge</span>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-teal-500/10">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs">L</div>
            <span className="text-sm font-medium"><span className="text-teal-500 font-bold">Lily</span> shared: Today I said thank you to myself</span>
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
