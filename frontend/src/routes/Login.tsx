import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLogin } from '../hooks/useLogin';

type AuthTab = 'password' | 'otp';

export default function Login() {
  const [activeTab, setActiveTab] = useState<AuthTab>('otp');
  const { loading, error, sendOTP, verifyOTP, signInWithPassword, clearError } = useLogin();
  const { registerProfile } = useAuth();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState<string | null>(null);

  // 密码登录
  const [pwdEmail, setPwdEmail] = useState('');
  const [password, setPassword] = useState('');

  // 验证码登录
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleAfterLogin = () => {
    navigate('/', { replace: true });
    void registerProfile('Community member').catch(() => {
      setLocalError('Signed in, but profile sync failed. Please refresh.');
    });
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!pwdEmail || !password) return;
    const success = await signInWithPassword(pwdEmail, password);
    if (success) handleAfterLogin();
  };

  const handleSendOtp = async () => {
    setLocalError(null);
    if (!otpEmail || !otpEmail.includes('@')) return;
    const success = await sendOTP(otpEmail);
    if (success) {
      setOtpSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!otp || otp.length < 6) return;
    const success = await verifyOTP(otpEmail, otp);
    if (success) handleAfterLogin();
  };

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setLocalError(null);
    clearError();
  };

  const displayError = localError || error;

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <div className="bg-white p-8 rounded-2xl border border-peach-100 shadow-sm">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-peach-500 to-peach-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md text-white">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="4.5" fill="currentColor" />
              <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M12 3.5v2.5" />
                <path d="M12 18v2.5" />
                <path d="M3.5 12h2.5" />
                <path d="M18 12h2.5" />
                <path d="M6 6l1.8 1.8" />
                <path d="M18 6l-1.8 1.8" />
                <path d="M6 18l1.8-1.8" />
                <path d="M18 18l-1.8-1.8" />
              </g>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brown-900">Welcome back</h1>
          <p className="text-sm text-gray-400 mt-1">Grow together in horizontal relationships</p>
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b border-peach-100 mb-6">
          <button
            type="button"
            onClick={() => switchTab('otp')}
            className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer ${
              activeTab === 'otp'
                ? 'border-peach-500 text-peach-800'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Email code
          </button>
          <button
            type="button"
            onClick={() => switchTab('password')}
            className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer ${
              activeTab === 'password'
                ? 'border-peach-500 text-peach-800'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Password
          </button>
        </div>

        {/* 错误提示 */}
        {displayError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{displayError}</div>
        )}

        {/* 验证码登录表单 */}
        {activeTab === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={otpEmail}
                onChange={e => setOtpEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="flex-1 px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || countdown > 0}
                  className="px-4 py-2.5 rounded-lg text-sm border border-peach-100 text-gray-600 cursor-pointer bg-white hover:bg-peach-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
                >
                  {countdown > 0 ? `${countdown}s` : otpSent ? 'Resend' : 'Send code'}
                </button>
              </div>
              {otpSent && !displayError && (
                <p className="text-xs text-green-600 mt-1">Code sent — check your inbox</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !otp}
              className="w-full py-2.5 bg-peach-500 text-white rounded-lg text-sm font-medium cursor-pointer border-0 hover:bg-peach-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Verifying...' : 'Sign in / Sign up'}
            </button>

            <p className="text-xs text-stone-400 text-center">
              No registration needed — new users get an account automatically
            </p>
          </form>
        )}

        {/* 密码登录表单 */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={pwdEmail}
                onChange={e => setPwdEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-peach-500 text-white rounded-lg text-sm font-medium cursor-pointer border-0 hover:bg-peach-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        {/* 底部链接 */}
        <p className="text-sm text-gray-400 text-center mt-6">
          No account yet?{' '}
          <Link to="/register" className="text-peach-700 no-underline hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
