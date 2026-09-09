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
      setLocalError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    // 1. 注册 Supabase Auth 账号；若邮箱已存在，尝试用当前密码登录并补全本地 profile。
    const signUpResult = await signUp(email, password);
    if (signUpResult === 'failed') return;

    // 2. 自动登录获取 session
    const loggedIn = await signInWithPassword(email, password);
    if (!loggedIn) {
      if (signUpResult === 'already_registered') {
        setLocalError('This email is already registered. Please sign in with your password, or use the email code on the sign-in page.');
        return;
      }
      setLocalError('Registration successful. Please return to the sign-in page and use the email code.');
      return;
    }

    // 3. 创建或补全 profile，并确保状态更新后再跳转首页
    try {
      await registerProfile('Community member');
      navigate('/');
    } catch {
      setLocalError('Signed in, but failed to create your profile. Please try again.');
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
          aria-label="Back"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-peach-500 to-peach-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <h1 className="text-2xl font-bold text-brown-900">Create Account</h1>
          <p className="text-sm text-gray-400 mt-1">Join the Adlerian Community and start your journey</p>
        </div>

        {/* 错误提示 */}
        {displayError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{displayError}</div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
            {/* 邮箱 */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
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
              <label className="block text-sm text-gray-600 mb-1">Set password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
              />
            </div>

            {/* 确认密码 */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-peach-500 text-white rounded-lg text-sm font-medium cursor-pointer border-0 hover:bg-peach-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>

            <p className="text-xs text-stone-400 text-center">
              By signing up you agree to the{' '}
              <a href="#" className="text-peach-700 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-peach-700 hover:underline">Privacy Policy</a>
            </p>
          </form>

        {/* 底部链接 */}
        <p className="text-sm text-gray-400 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-peach-700 no-underline hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
