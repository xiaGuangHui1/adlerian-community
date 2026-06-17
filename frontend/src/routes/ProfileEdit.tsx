import { useEffect, useState } from 'react';
import { Icon } from '@iconify-icon/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProfileEdit() {
  const { user, profile, loading, registerProfile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!profile) {
      if (!loading && user) {
        const fallbackName = user.email?.split('@')[0] || '社区成员';
        Promise.resolve().then(() => {
          setNickname(prev => prev || fallbackName);
        });
      }
      return;
    }
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setNickname(profile.nickname);
      setAvatarUrl(profile.avatarUrl || '');
      setBio(profile.bio || '');
    });
    return () => {
      active = false;
    };
  }, [loading, profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNickname = nickname.trim();
    const trimmedAvatarUrl = avatarUrl.trim();
    const trimmedBio = bio.trim();

    if (!trimmedNickname) {
      setError('昵称不能为空');
      return;
    }

    setSaving(true);
    setError('');
    try {
      let updated = profile;
      if (profile) {
        updated = await updateProfile({
          nickname: trimmedNickname,
          avatarUrl: trimmedAvatarUrl,
          bio: trimmedBio,
        });
      } else {
        updated = await registerProfile(trimmedNickname);
        if (trimmedAvatarUrl || trimmedBio) {
          updated = await updateProfile({
            nickname: trimmedNickname,
            avatarUrl: trimmedAvatarUrl,
            bio: trimmedBio,
          });
        }
      }
      navigate(`/profile/${updated.id}`);
    } catch {
      setError('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-gray-400">加载中...</div>;
  }

  if (!user) {
    return null;
  }

  const isCompletingProfile = !profile;
  const profileInitial = (nickname || profile?.nickname || '勇').charAt(0);
  const returnPath = profile ? `/profile/${profile.id}` : '/';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to={returnPath}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-peach-600 no-underline transition-colors"
        >
          <Icon icon="ph:arrow-left" width="16" />
          {profile ? '返回个人主页' : '返回首页'}
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-peach-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-peach-50">
          <h1 className="text-2xl font-bold text-brown-900">
            {isCompletingProfile ? '完善资料' : '编辑资料'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {isCompletingProfile ? '创建你在社区中的公开身份' : '更新你在社区中的公开信息'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
          )}

          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={nickname || profile?.nickname || '社区成员'}
                className="w-20 h-20 rounded-full object-cover border-4 border-peach-50"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-peach-300 to-teal-300 flex items-center justify-center text-2xl text-white border-4 border-peach-50">
                {profileInitial}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-brown-900">公开头像</p>
              <p className="text-xs text-gray-400 mt-1">填写图片 URL 后会立即用于预览</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={50}
              required
              className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">头像 URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">个人简介</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={5}
              maxLength={300}
              placeholder="写一点你想让伙伴们了解的内容"
              className="w-full px-3 py-2.5 border border-peach-100 rounded-lg text-sm focus:outline-none focus:border-peach-400 bg-warm-50 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{bio.length}/300</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              to={returnPath}
              className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 no-underline transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-peach-500 text-white rounded-lg text-sm font-medium border-0 cursor-pointer hover:bg-peach-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon icon={saving ? 'ph:circle-notch' : 'ph:check'} width="16" />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
