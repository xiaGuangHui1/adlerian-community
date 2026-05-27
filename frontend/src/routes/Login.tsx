import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import api from '../lib/api';

type AuthTab = 'password' | 'otp';

export default function Login() {
  const [activeTab, setActiveTab] = useState<AuthTab>('password');
  const { loading, error, sendOTP, verifyOTP, signInWithPassword, clearError } = useLogin();
  const navigate = useNavigate();

  // 密码登录
  const [pwdEmail, setPwdEmail] = useState('');
  const [password, setPassword] = useState('');

  // 验证码登录
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleAfterLogin = async () => {
    try {
      await api.get('/users/me');
      navigate('/');
    } catch {
      // 新用户，跳转去设置昵称
      navigate('/register');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdEmail || !password) return;
    const success = await signInWithPassword(pwdEmail, password);
    if (success) await handleAfterLogin();
  };

  const handleSendOtp = async () => {
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
    if (!otp || otp.length < 6) return;
    const success = await verifyOTP(otpEmail, otp);
    if (success) await handleAfterLogin();
  };

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    clearError();
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <div className="bg-white p-8 rounded-2xl border border-peach-100 shadow-sm">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-peach-500 to-peach-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white font-bold text-lg">勇</span>
          </div>
          <h1 className="text-2xl font-bold text-brown-900">欢迎回来</h1>
          <p className="text-sm text-gray-400 mt-1">在横向关系中共同成长</p>
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b border-peach-100 mb-6">
          <button
            type="button"
            onClick={() => switchTab('password')}
            className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer ${
              activeTab === 'password'
                ? 'border-peach-500 text-peach-800'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            密码登录
          </button>
          <button
            type="button"
            onClick={() => switchTab('otp')}
            className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer ${
              activeTab === 'otp'
                ? 'border-peach-500 text-peach-800'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            验证码登录
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
        )}

        {/* 密码登录表单 */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">邮箱</label>
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
              <label className="block text-sm text-gray-600 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="输入密码"
                required
                className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-peach-500 text-white rounded-lg text-sm font-medium cursor-pointer border-0 hover:bg-peach-600 disabled:opacity-50 transition-colors"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        )}

        {/* 验证码登录表单 */}
        {activeTab === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">邮箱</label>
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
              <label className="block text-sm text-gray-600 mb-1">验证码</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="6 位验证码"
                  maxLength={6}
                  className="flex-1 px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || countdown > 0}
                  className="px-4 py-2.5 rounded-lg text-sm border border-peach-100 text-gray-600 cursor-pointer bg-white hover:bg-peach-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
                >
                  {countdown > 0 ? `${countdown}s` : otpSent ? '重新发送' : '发送验证码'}
                </button>
              </div>
              {otpSent && !error && (
                <p className="text-xs text-green-600 mt-1">验证码已发送，请查收邮箱</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !otp}
              className="w-full py-2.5 bg-peach-500 text-white rounded-lg text-sm font-medium cursor-pointer border-0 hover:bg-peach-600 disabled:opacity-50 transition-colors"
            >
              {loading ? '验证中...' : '登录 / 注册'}
            </button>

            <p className="text-xs text-stone-400 text-center">
              验证码登录无需注册，新用户自动创建账号
            </p>
          </form>
        )}

        {/* 底部链接 */}
        <p className="text-sm text-gray-400 text-center mt-6">
          还没有账号？{' '}
          <Link to="/register" className="text-peach-700 no-underline hover:underline font-medium">
            注册
          </Link>
        </p>
      </div>
    </div>
  );
}
