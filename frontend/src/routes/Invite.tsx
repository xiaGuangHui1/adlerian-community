import { useCallback, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import axios from 'axios';
import api from '../lib/api';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { useShare } from '../hooks/useShare';
import type { TeamInfo, TeamInvitation, CreateTeamResponse } from '../types';

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export default function Invite() {
  const { user } = useAuth();
  const { shareOrCopy, shareTeam, copied } = useShare();
  const [searchParams] = useSearchParams();
  const teamCode = searchParams.get('team');

  const [myTeam, setMyTeam] = useState<TeamInfo | null | undefined>(undefined);
  const [teamInvitation, setTeamInvitation] = useState<TeamInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [shareTarget, setShareTarget] = useState<'default' | 'team'>('default');
  const [pendingInviteCode, setPendingInviteCode] = useState('');
  const [teamName, setTeamName] = useState('');

  const fetchPageData = useCallback(async () => {
    await Promise.resolve();
    const promises: Promise<unknown>[] = [];
    if (user) {
      promises.push(
        api.get<TeamInfo>('/teams/my')
          .then(r => setMyTeam(r.data))
          .catch(() => setMyTeam(null))
      );
    } else {
      setMyTeam(null);
    }
    if (teamCode) {
      promises.push(
        api.get<TeamInvitation>(`/teams/invitation/${teamCode}`)
          .then(r => setTeamInvitation(r.data))
          .catch(() => setTeamInvitation(null))
      );
    } else {
      setTeamInvitation(null);
    }
    await Promise.allSettled(promises);
    setLoading(false);
  }, [teamCode, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchPageData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchPageData]);

  const handleCreateTeam = async () => {
    setCreatingTeam(true);
    try {
      const { data } = await api.post<CreateTeamResponse>('/teams', { name: teamName });
      setPendingInviteCode(data.inviteCode);
      setShareTarget('team');
      setShowSharePanel(true);
    } catch (error: unknown) {
      alert(getErrorMessage(error, '创建失败'));
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleShareTeam = async () => {
    setShareTarget('team');
    setShowSharePanel(true);
  };

  const handleJoinTeam = async () => {
    setJoiningTeam(true);
    setJoinError('');
    try {
      if (!user) {
        return;
      }
      await api.post('/teams/join-by-code', { code: teamCode });
      await fetchPageData();
    } catch (error: unknown) {
      setJoinError(getErrorMessage(error, '加入失败'));
    } finally {
      setJoiningTeam(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-pulse">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-5 w-72 mb-8" />
        <div className="bg-white rounded-3xl p-8 border border-orange-50 space-y-4">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    );
  }

  const activeInviteCode = myTeam?.inviteCode || pendingInviteCode;

  const handleShare = () => {
    if (shareTarget === 'team' && activeInviteCode) {
      void shareTeam(activeInviteCode, myTeam?.name || '');
      return;
    }
    void shareOrCopy();
  };

  const handleConfirmShare = () => {
    handleShare();
    setShowSharePanel(false);
  };

  const sharePanel = showSharePanel && (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowSharePanel(false)} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-6 pt-6 pb-10 max-w-lg mx-auto animate-slide-up">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
        <h3 className="text-lg font-bold text-center mb-2">邀请组队伙伴</h3>
        <p className="text-xs text-gray-400 text-center mb-6">选择一种方式分享邀请</p>

        <div className="flex justify-center gap-8 mb-8">
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-2 cursor-pointer border-0 bg-transparent"
          >
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-500 shadow-sm hover:scale-105 transition-transform">
              <Icon icon="ph:wechat-logo-fill" width="32" />
            </div>
            <span className="text-xs text-gray-600 font-medium">微信好友</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-2 cursor-pointer border-0 bg-transparent"
          >
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-500 shadow-sm hover:scale-105 transition-transform">
              <Icon icon="ph:wechat-logo-fill" width="32" />
            </div>
            <span className="text-xs text-gray-600 font-medium">朋友圈</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-2 cursor-pointer border-0 bg-transparent"
          >
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-peach-500 shadow-sm hover:scale-105 transition-transform">
              <Icon icon="ph:link-fill" width="32" />
            </div>
            <span className="text-xs text-gray-600 font-medium">复制链接</span>
          </button>
        </div>

        <div className="bg-warm-50 rounded-2xl p-4 border border-orange-50 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-peach-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256"><path d="M128,72a56,56,0,1,0-56,56A56,56,0,0,0,128,72Z"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-brown-900">阿德勒心理学社区</p>
              <p className="text-xs text-gray-400">邀请你加入组队打卡</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed ml-11">「组队打卡，互相鼓励走得更远」</p>
        </div>

        <button
          onClick={handleConfirmShare}
          className="w-full bg-teal-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-teal-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
        >
          <Icon icon="ph:check-circle-fill" width="22" />
          确认分享
        </button>
        {copied && (
          <p className="text-xs text-teal-500 text-center mt-3 font-medium">链接已复制！</p>
        )}
        <p className="text-xs text-gray-400 text-center mt-3">分享后伙伴可凭链接加入你的队伍</p>
      </div>
    </div>
  );

  // ========== 状态: 已登录 + 有活跃队伍 ==========
  if (user && myTeam && myTeam.status === 'ACTIVE') {
    const checkedCount = myTeam.members.filter(m => m.todayCheckedIn).length;

    return (
      <>
        <section className="pt-6 pb-20">
          <div className="max-w-lg mx-auto px-4 fade-in">
            {/* 返回按钮 */}
            <div className="mb-6 text-center">
              <button
                onClick={() => { setMyTeam(null); }}
                className="text-xs text-gray-400 hover:text-peach-500 transition-colors flex items-center gap-1 mx-auto cursor-pointer border-0 bg-transparent"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/></svg>
                回到组队广场
              </button>
            </div>

            {/* 队伍卡片 */}
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-orange-50">
              {/* 顶部 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-peach-400 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 256 256"><path d="M136,108A52,52,0,1,1,84,56,52.06,52.06,0,0,1,136,108ZM200,88a44,44,0,1,1-44-44A44.05,44.05,0,0,1,200,88Z"/></svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-brown-900">{myTeam.name}</h2>
                    <p className="text-xs text-gray-400">今日打卡进行中</p>
                  </div>
                </div>
                <span className="text-xs bg-peach-500/10 text-peach-500 font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 256 256"><path d="M225.9,106.65l-88-48.18a20.36,20.36,0,0,0-19.8,0l-88,48.18A20,20,0,0,0,20,122.12v19.81a8,8,0,0,0,16,0v-14L120,165.87v49.21l-17.57,7.84a8,8,0,0,0,0,14.16l24,10.72a8,8,0,0,0,7.14,0l24-10.72a8,8,0,0,0,0-14.16L140,215.08V165.87l84-37.94v14a8,8,0,0,0,16,0V122.12A20,20,0,0,0,225.9,106.65Z"/></svg>
                  已组队 {myTeam.togetherDays || 1} 天
                </span>
              </div>

              {/* 成员头像行 */}
              <div className="flex justify-center gap-6 mb-6">
                {myTeam.members.map((member) => (
                  <div key={member.userId} className="flex flex-col items-center gap-1.5">
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-sm overflow-hidden ${
                      member.isCreator
                        ? 'border-peach-500/30'
                        : member.todayCheckedIn
                          ? 'border-teal-500/30'
                          : 'border-transparent'
                    }`}>
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.nickname} className="w-full h-full object-cover" />
                      ) : (
                        <span className={`w-full h-full flex items-center justify-center text-lg font-bold ${
                          member.isCreator
                            ? 'bg-orange-100 text-peach-500'
                            : member.todayCheckedIn
                              ? 'bg-teal-100 text-teal-500'
                              : 'bg-gray-100 text-gray-400'
                        }`}>
                          {member.nickname.charAt(0)}
                        </span>
                      )}
                    </div>
                    {member.todayCheckedIn ? (
                      <span className="text-xs flex items-center gap-0.5 text-teal-500 font-medium">
                        已打卡 <span className="text-sm leading-none">&check;</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">未打卡</span>
                    )}
                  </div>
                ))}
              </div>

              {/* 集体数据 */}
              <div className="bg-warm-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-center gap-8 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-peach-500">{myTeam.togetherDays || 1}</p>
                    <p className="text-xs text-gray-500 mt-0.5">已组队天数</p>
                  </div>
                  <div className="w-px h-10 bg-orange-100" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-500">{checkedCount}/{myTeam.members.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">今日打卡率</p>
                  </div>
                  <div className="w-px h-10 bg-orange-100" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-brown-900">{myTeam.totalCheckIns || 0}</p>
                    <p className="text-xs text-gray-500 mt-0.5">累计打卡数</p>
                  </div>
                </div>
              </div>

              {/* 打卡动态 */}
              {myTeam.recentActivities && myTeam.recentActivities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-brown-900 mb-4 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-peach-500" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm56,112H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48a8,8,0,0,1,0,16Z"/></svg>
                    最近打卡动态
                  </h3>
                  <div className="space-y-3">
                    {myTeam.recentActivities.map((activity, i) => {
                      const isToday = activity.relativeTime === '刚刚' || activity.relativeTime?.includes('小时前');
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${isToday ? 'bg-teal-500' : 'bg-gray-300'}`} />
                          <div className="flex-1">
                            <p className={`text-sm ${isToday ? 'text-gray-700' : 'text-gray-500'}`}>
                              <span className="font-medium text-brown-900">{activity.nickname}</span>
                              {isToday ? ' 完成了今日打卡' : ' 昨日也完成了打卡 '}
                              {!isToday && <span>💪</span>}
                            </p>
                            <p className="text-xs text-gray-400">{activity.relativeTime}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 邀请新伙伴 */}
              <button
                onClick={handleShareTeam}
                className="w-full border-2 border-dashed border-peach-500/40 text-peach-500 font-bold py-3.5 rounded-2xl hover:bg-peach-500/5 hover:border-peach-500 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer bg-transparent"
              >
                <Icon icon="ph:plus-circle-fill" width="18" />
                邀请新伙伴加入
              </button>
            </div>

            {/* 底部引用 */}
            <p className="text-xs text-gray-400 text-center mt-8 leading-relaxed">
              「组队不是竞赛，是彼此照亮前路的光」
            </p>
          </div>
        </section>
        {sharePanel}
      </>
    );
  }

  // ========== 状态: 未登录 + teamCode 队伍邀请着陆页 ==========
  if (!user && teamCode && teamInvitation) {
    const isPending = teamInvitation.status === 'PENDING';
    const isExpired = teamInvitation.status === 'EXPIRED' || teamInvitation.status === 'DISBANDED';

    return (
      <section className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-8">
          <div className="max-w-lg mx-auto px-6 text-center fade-in">
            <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full text-sm text-gray-500 mb-8 border border-orange-100">
              <svg className="w-5 h-5 text-peach-500" fill="currentColor" viewBox="0 0 256 256"><path d="M136,108A52,52,0,1,1,84,56,52.06,52.06,0,0,1,136,108Zm-16,0a36,36,0,1,0-36,36A36,36,0,0,0,120,108ZM200,88a44,44,0,1,1-44-44A44.05,44.05,0,0,1,200,88Z"/></svg>
              收到组队邀请
            </div>

            {isPending ? (
              <>
                <h1 className="text-3xl font-bold text-brown-900 mb-4 leading-snug">
                  <span className="text-peach-500">{teamInvitation.creatorNickname}</span> 邀请你<br />加入队伍
                </h1>
                <p className="text-gray-500 text-lg mb-8">每天 20:00 前打卡，互相见证彼此的成长。</p>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <button
                    onClick={handleJoinTeam}
                    disabled={joiningTeam}
                    className="bg-peach-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-orange-200 cursor-pointer border-0 disabled:opacity-60"
                  >
                    {joiningTeam ? '加入中...' : '加入队伍'}
                  </button>
                  <Link
                    to="/login"
                    className="bg-white text-teal-500 border-2 border-teal-500 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-teal-500 hover:text-white transition-all no-underline"
                  >
                    已有账号？登录
                  </Link>
                </div>
                {joinError && (
                  <p className="mt-4 text-sm text-red-500">{joinError}</p>
                )}
              </>
            ) : isExpired ? (
              <>
                <h1 className="text-3xl font-bold text-brown-900 mb-4 leading-snug">
                  这个邀请<span className="text-gray-400"><br />已经</span><span className="text-peach-500">过期了</span>
                </h1>
                <p className="text-gray-500 text-lg mb-8">
                  但没关系，你仍然可以加入阿德勒心理学社区，发起你自己的队伍。
                </p>
                <Link
                  to="/register"
                  className="inline-flex bg-peach-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-orange-200 no-underline"
                >
                  加入勇气之旅
                </Link>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-brown-900 mb-4 leading-snug">
                  <span className="text-peach-500">{teamInvitation.creatorNickname}</span> 的<br />队伍
                </h1>
                <p className="text-gray-500 text-lg mb-8">
                  该队伍已有 {teamInvitation.memberCount}/{teamInvitation.maxMembers} 人，正在组队中。
                </p>
              </>
            )}
          </div>
        </section>
    );
  }

  // ========== 状态: 默认邀请页 (没有队伍) ==========
  return (
    <>
      <section className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-8">
        <div className="max-w-lg mx-auto px-6 text-center fade-in">
          {/* 装饰图标 */}
          <div className="w-20 h-20 bg-gradient-to-br from-peach-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Icon icon="ph:hand-heart-fill" width="40" className="text-peach-500" />
          </div>

          {/* 邀请语 */}
          <h1 className="text-3xl font-bold text-brown-900 mb-4 leading-snug">组队打卡，和伙伴互相鼓励</h1>
          <p className="text-gray-500 text-lg mb-2 leading-relaxed">互相鼓励走得更远</p>

          {/* 装饰分隔线 */}
          <div className="flex items-center gap-3 my-8 justify-center">
            <span className="h-px w-12 bg-peach-500/30"></span>
            <svg className="w-3.5 h-3.5 text-peach-500/50" fill="currentColor" viewBox="0 0 256 256"><path d="M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z"/></svg>
            <span className="h-px w-12 bg-peach-500/30"></span>
          </div>

          {/* 队伍名称输入 */}
          {user && (
            <div className="max-w-sm mx-auto mb-4">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                maxLength={20}
                placeholder="给队伍起个名字（可选）"
                className="w-full px-4 py-3 border border-peach-100 rounded-2xl text-sm text-center focus:outline-none focus:border-peach-400 bg-white"
              />
            </div>
          )}

          {/* 邀请按钮 */}
          {user ? (
            <button
              onClick={handleCreateTeam}
              disabled={creatingTeam}
              className="bg-peach-500 text-white px-12 py-5 rounded-2xl text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-3 mx-auto w-full max-w-sm cursor-pointer border-0 disabled:opacity-60"
            >
              <Icon icon="ph:share-network-fill" width="24" />
              {creatingTeam ? '创建中...' : '邀请组队伙伴'}
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-peach-500 text-white px-12 py-5 rounded-2xl text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-3 mx-auto w-full max-w-sm cursor-pointer no-underline"
            >
              <Icon icon="ph:sign-in-fill" width="24" />
              登录后发起组队
            </Link>
          )}

          {/* 底部小提示 */}
          <p className="text-xs text-gray-400 mt-8 flex items-center justify-center gap-1">
            <svg className="w-3.5 h-3.5 text-teal-500" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm56,112H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48a8,8,0,0,1,0,16Z"/></svg>
            点击按钮，邀请好友一起组队打卡
          </p>
        </div>
      </section>

      {sharePanel}
    </>
  );
}
