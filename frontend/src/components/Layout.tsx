import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { path: '/', label: '首页' },
  { path: '/forum', label: '互助广场' },
  { path: '/knowledge-base', label: '理论学习' },
  { path: '/checkin', label: '实践打卡' },
  { path: '/invite', label: '结伴同行' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const location = useLocation();
  const userMetadata = user?.user_metadata as Record<string, unknown> | undefined;
  const userAvatarUrl = typeof userMetadata?.avatar_url === 'string'
    ? userMetadata.avatar_url
    : typeof userMetadata?.picture === 'string'
      ? userMetadata.picture
      : undefined;
  const avatarUrl = profile?.avatarUrl || userAvatarUrl;
  const displayName = profile?.nickname || user?.email?.split('@')[0] || '社区成员';
  const profileInitial = displayName.trim().charAt(0) || '勇';
  const profilePath = profile ? `/profile/${profile.id}` : '/profile/edit';

  return (
    <div className="min-h-screen bg-warm-50">
      {/* 导航栏 */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-peach-100/60 sticky top-0 z-50 shadow-[0_1px_3px_rgba(232,168,124,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brown-900 no-underline active:scale-95 transition-transform">
              <span className="w-8 h-8 bg-gradient-to-br from-peach-500 to-peach-600 rounded-full flex items-center justify-center text-white text-sm shadow-sm shadow-orange-200">勇</span>
              阿德勒心理学社区
            </Link>
            <div className="hidden md:flex gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-3 py-2 rounded-lg text-sm no-underline transition-all duration-200 ${
                      isActive
                        ? 'bg-peach-100/80 text-peach-800 font-medium shadow-sm'
                        : 'text-gray-500 hover:bg-peach-50/80 hover:text-peach-700'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-peach-400 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={profilePath}
                className="w-9 h-9 rounded-full border-2 border-peach-100 overflow-hidden bg-gradient-to-br from-peach-300 to-teal-300 text-white flex items-center justify-center text-sm font-bold hover:border-peach-300 transition-colors no-underline"
                aria-label={profile ? `${displayName}的个人主页` : '完善资料'}
                title={displayName}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profileInitial
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-peach-500 text-white rounded-lg text-sm no-underline hover:bg-peach-600 transition-colors"
              >
                登录
              </Link>
            )}
          </div>
        </div>

        {/* 移动端导航 */}
        <div className="md:hidden flex overflow-x-auto border-t border-peach-50/60 px-2 pb-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2.5 text-sm whitespace-nowrap no-underline transition-colors duration-200 ${
                  isActive
                    ? 'text-peach-700 font-semibold'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-peach-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="bg-brown-900 text-warm-50 pt-20 pb-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* 品牌 */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-peach-500 rounded-full flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 256 256"><path d="M128,72a8,8,0,0,1,8,8v24h16a8,8,0,0,1,0,16H136v56a8,8,0,0,1-16,0V120H104a8,8,0,0,1,0-16h16V80A8,8,0,0,1,128,72ZM80,24H176a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16ZM240,88V200a24,24,0,0,1-24,24H40a24,24,0,0,1-24-24V88A24,24,0,0,1,40,64H72A8,8,0,0,1,80,72v8h96V72a8,8,0,0,1,8-8h32A24,24,0,0,1,240,88ZM216,88a8,8,0,0,0-8-8H184v8a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V80H48a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8Z"/></svg>
                </div>
                <span className="text-xl font-bold tracking-tight">阿德勒心理学社区</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                一个面向大众的阿德勒心理学实践社区。我们致力于帮助每个人找回勇气，建立共同体感觉，过上幸福自由的人生。
              </p>
            </div>

            {/* 快速链接 */}
            <div>
              <h4 className="font-bold mb-6">快速链接</h4>
              <ul className="space-y-4 text-gray-400 text-sm list-none p-0">
                <li><Link to="/" className="hover:text-peach-500 transition-colors no-underline">社区首页</Link></li>
                <li><Link to="/forum" className="hover:text-peach-500 transition-colors no-underline">互助广场</Link></li>
                <li><Link to="/knowledge-base" className="hover:text-peach-500 transition-colors no-underline">理论学习</Link></li>
                <li><Link to="/checkin" className="hover:text-peach-500 transition-colors no-underline">实践打卡</Link></li>
                <li><Link to="/invite" className="hover:text-peach-500 transition-colors no-underline">结伴同行</Link></li>
              </ul>
            </div>

            {/* 关于我们 */}
            <div>
              <h4 className="font-bold mb-6">关于我们</h4>
              <ul className="space-y-4 text-gray-400 text-sm list-none p-0">
                <li><a href="#" className="hover:text-peach-500 transition-colors no-underline">关于社区</a></li>
                <li><a href="#" className="hover:text-peach-500 transition-colors no-underline">加入我们</a></li>
                <li><a href="#" className="hover:text-peach-500 transition-colors no-underline">联系合作</a></li>
                <li><a href="#" className="hover:text-peach-500 transition-colors no-underline">版权声明</a></li>
              </ul>
            </div>

            {/* 关注我们 */}
            <div>
              <h4 className="font-bold mb-6">关注我们</h4>
              <div className="flex gap-4 mb-6">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-peach-500 transition-colors no-underline">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48V88H40V48a8,8,0,0,1,8-8H208A8,8,0,0,1,216,48ZM40,168V104H216v64a16,16,0,0,1-16,16H56A16,16,0,0,1,40,168Z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-peach-500 transition-colors no-underline">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 256 256"><path d="M232,64V224a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H80V48a8,8,0,0,1,8-8h80a8,8,0,0,1,8,8v8h48A8,8,0,0,1,232,64ZM96,56h64V48H96ZM216,72H40v52.69L70.19,122a16,16,0,0,1,18.12.84l54.41,40.81L192.19,98.14A16,16,0,0,1,216,98.86V72Z"/></svg>
                </a>
              </div>
              <p className="text-xs text-gray-500">© 2026 阿德勒心理学社区. All Rights Reserved.</p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs">鼓励而非表扬 · 课题分离 · 共同体感觉 · 横向关系</p>
            <div className="flex gap-6 text-gray-500 text-xs">
              <a href="#" className="hover:text-peach-500 no-underline transition-colors">隐私政策</a>
              <a href="#" className="hover:text-peach-500 no-underline transition-colors">服务条款</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
