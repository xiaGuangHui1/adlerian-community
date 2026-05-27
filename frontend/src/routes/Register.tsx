import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLogin } from '../hooks/useLogin';

export default function Register() {
  const { user, profile, registerProfile, signIn } = useAuth();
  const { loading, error, signUp, sendOTP, clearError } = useLogin();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: 注册, 2: 设置昵称

  // Step 1
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [localError, setLocalError] = useState('');

  // Step 2
  const [nickname, setNickname] = useState('');
  const [nicknameLoading, setNicknameLoading] = useState(false);

  // OTP 登录的新用户已有 user 但无 profile，直接进入昵称设置
  useEffect(() => {
    if (user && !profile) {
      setStep(2);
    } else if (user && profile) {
      navigate('/');
    }
  }, [user, profile, navigate]);

  const handleSendOtp = async () => {
    setLocalError('');
    if (!email || !email.includes('@')) {
      setLocalError('请输入有效的邮箱地址');
      return;
    }
    const success = await sendOTP(email);
    if (success) {
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
  };

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

    const success = await signUp(email, password);
    if (success) {
      // 注册成功后自动登录，进入昵称设置
      try {
        await signIn(email, password);
        setStep(2);
      } catch {
        setLocalError('注册成功，请前往登录');
      }
    }
  };

  const handleSetNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setNicknameLoading(true);
    try {
      await registerProfile(nickname);
      navigate('/');
    } catch (err: any) {
      setLocalError(err.message || '设置昵称失败');
    } finally {
      setNicknameLoading(false);
    }
  };

  const displayError = localError || error;

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
          <h1 className="text-2xl font-bold text-brown-900">
            {step === 1 ? '创建账号' : '设置你的昵称'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {step === 1 ? '加入勇气工坊，开始你的成长之旅' : '在社群中，我们都是平等的伙伴'}
          </p>
        </div>

        {/* 错误提示 */}
        {displayError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{displayError}</div>
        )}

        {step === 1 ? (
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

            {/* 验证码（选填） */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">验证码</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="6 位验证码（选填）"
                  maxLength={6}
                  className="flex-1 px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || countdown > 0}
                  className="px-4 py-2.5 rounded-lg text-sm border border-peach-100 text-gray-600 cursor-pointer bg-white hover:bg-peach-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
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
        ) : (
          <form onSubmit={handleSetNickname} className="space-y-4">
            <div>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                required
                maxLength={50}
                placeholder="你的昵称"
                className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
              />
            </div>
            <button
              type="submit"
              disabled={nicknameLoading || !nickname.trim()}
              className="w-full py-2.5 bg-peach-500 text-white rounded-lg text-sm font-medium cursor-pointer border-0 hover:bg-peach-600 disabled:opacity-50 transition-colors"
            >
              {nicknameLoading ? '设置中...' : '完成注册'}
            </button>
          </form>
        )}

        {/* 底部链接 */}
        {step === 1 && (
          <p className="text-sm text-gray-400 text-center mt-6">
            已有账号？{' '}
            <Link to="/login" className="text-peach-700 no-underline hover:underline font-medium">
              去登录
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
