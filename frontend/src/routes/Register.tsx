import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLogin } from '../hooks/useLogin';

export default function Register() {
  const { registerProfile } = useAuth();
  const { loading, error, signUp, signInWithPassword, clearError } = useLogin();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  // ── 注册 ────────────────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !email.includes('@')) {
      setLocalError('请输入有效的邮箱地址');
      return;
    }
    if (password.length < 6) {
      setLocalError('密码至少需要 6 个字符');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('两次输入的密码不一致');
      return;
    }

    // 1. 注册 Supabase Auth 账号；若邮箱已存在，尝试用当前密码登录并补全本地 profile。
    const signUpResult = await signUp(email, password);
    if (signUpResult === 'failed') return;

    // 2. 自动登录获取 session
    const loggedIn = await signInWithPassword(email, password);
    if (!loggedIn) {
      if (signUpResult === 'already_registered') {
        setLocalError('该邮箱已注册。请用已有密码登录，或返回登录页使用邮箱验证码登录。');
        return;
      }
      setLocalError('注册成功，请返回登录页使用邮箱验证码完成登录。');
      return;
    }

    // 3. 创建或补全 profile，并确保状态更新后再跳转首页
    try {
      await registerProfile('社区成员');
      navigate('/');
    } catch {
      setLocalError('账号已登录，但创建社区资料失败，请稍后重试');
    }
  };

  const displayError = localError || error;

  // ── 渲染 ────────────────────────────────────

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <div className="bg-white p-8 rounded-2xl border border-peach-100 shadow-sm relative">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-peach-100 transition-colors bg-transparent border-0 cursor-pointer"
          aria-label="返回"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-peach-500 to-peach-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white font-bold text-lg">勇</span>
          </div>
          <h1 className="text-2xl font-bold text-brown-900">创建账号</h1>
          <p className="text-sm text-gray-400 mt-1">加入阿德勒心理学社区，开始你的成长之旅</p>
        </div>

        {/* 错误提示 */}
        {displayError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{displayError}</div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
            {/* 邮箱 */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">邮箱地址</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">设置密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="至少 6 个字符"
                required
                minLength={6}
                className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
              />
            </div>

            {/* 确认密码 */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                required
                className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-peach-500 text-white rounded-lg text-sm font-medium cursor-pointer border-0 hover:bg-peach-600 disabled:opacity-50 transition-colors"
            >
              {loading ? '注册中...' : '注册'}
            </button>

            <p className="text-xs text-stone-400 text-center">
              注册即表示您同意{' '}
              <a href="#" className="text-peach-700 hover:underline">服务条款</a>
              {' '}和{' '}
              <a href="#" className="text-peach-700 hover:underline">隐私政策</a>
            </p>
          </form>

        {/* 底部链接 */}
        <p className="text-sm text-gray-400 text-center mt-6">
          已有账号？{' '}
          <Link to="/login" className="text-peach-700 no-underline hover:underline font-medium">
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}
