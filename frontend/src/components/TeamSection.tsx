import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import Avatar from './Avatar';
import Skeleton from './Skeleton';
import { useShare } from '../hooks/useShare';
import type { TeamInfo, TeamSummary } from '../types';

export default function TeamSection() {
  const { shareTeam, copied } = useShare();
  const [myTeam, setMyTeam] = useState<TeamInfo | null | undefined>(undefined);
  const [openTeams, setOpenTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [myRes, openRes] = await Promise.allSettled([
        api.get<TeamInfo>('/teams/my'),
        api.get<TeamSummary[]>('/teams/open'),
      ]);
      if (myRes.status === 'fulfilled') setMyTeam(myRes.value.data);
      else setMyTeam(null);
      if (openRes.status === 'fulfilled') setOpenTeams(openRes.value.data);
      else setOpenTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await api.post('/teams', { name: teamName });
      setTeamName('');
      await fetchData();
    } catch {
      alert('Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (id: number) => {
    setJoiningId(id);
    try {
      await api.post(`/teams/${id}/join`);
      await fetchData();
    } catch {
      alert('Failed to join — the team may be full or you are already in one');
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-orange-50 space-y-4 animate-pulse">
        <Skeleton className="h-6 w-1/3" />
        <div className="flex gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  // 已在队伍中 → 队伍卡片
  if (myTeam && myTeam.status === 'ACTIVE') {
    const checkedCount = myTeam.members.filter((m) => m.todayCheckedIn).length;
    return (
      <div className="bg-white rounded-3xl p-6 border border-orange-50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-brown-900">{myTeam.name}</h2>
            <p className="text-xs text-gray-400 mt-1">Team check-in · In progress today</p>
          </div>
          <button
            onClick={() => myTeam.inviteCode && shareTeam(myTeam.inviteCode, myTeam.name)}
            className="text-sm text-peach-500 border border-peach-300 rounded-full px-4 py-1.5 bg-white hover:bg-peach-50 transition-colors cursor-pointer"
          >
            {copied ? 'Link copied' : 'Invite'}
          </button>
        </div>

        <div className="flex justify-center gap-6 mb-6">
          {myTeam.members.map((member) => (
            <div key={member.userId} className="flex flex-col items-center gap-1.5">
              <div className={`rounded-full border-2 ${
                member.isCreator ? 'border-peach-500/40' : member.todayCheckedIn ? 'border-teal-500/40' : 'border-transparent'
              }`}>
                <Avatar
                  name={member.nickname}
                  src={member.avatarUrl}
                  className="w-14 h-14"
                  textClassName="text-lg"
                />
              </div>
              <span className="text-xs text-gray-600">{member.nickname}</span>
              <span className={`text-xs ${member.todayCheckedIn ? 'text-teal-500' : 'text-gray-400'}`}>
                {member.todayCheckedIn ? 'Checked in ✓' : 'Not yet'}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-warm-50 rounded-2xl p-4 flex items-center justify-center gap-8 text-center">
          <div>
            <p className="text-2xl font-bold text-peach-500">{myTeam.togetherDays || 1}</p>
            <p className="text-xs text-gray-500 mt-0.5">Days together</p>
          </div>
          <div className="w-px h-10 bg-orange-100" />
          <div>
            <p className="text-2xl font-bold text-teal-500">{checkedCount}/{myTeam.members.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Today's rate</p>
          </div>
          <div className="w-px h-10 bg-orange-100" />
          <div>
            <p className="text-2xl font-bold text-brown-900">{myTeam.totalCheckIns || 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total check-ins</p>
          </div>
        </div>
      </div>
    );
  }

  // 未加入队伍 → 创建 + 组队大厅
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-orange-50">
        <h2 className="text-lg font-bold text-brown-900 mb-3">Create a Team</h2>
        <div className="flex gap-2">
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            maxLength={20}
            placeholder="Name your team (optional)"
            className="flex-1 px-4 py-2.5 border border-peach-100 rounded-2xl text-sm focus:outline-none focus:border-peach-400 bg-white"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-5 py-2.5 bg-peach-500 text-white rounded-2xl text-sm font-bold hover:bg-peach-600 transition-colors cursor-pointer border-0 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-brown-900 mb-3">Team Lobby</h2>
        {openTeams.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-gray-400 border border-orange-50">
            No teams to join yet — create one
          </div>
        ) : (
          <div className="space-y-3">
            {openTeams.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl p-4 border border-orange-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={t.creatorNickname} src={t.creatorAvatarUrl} className="w-10 h-10" textClassName="text-xs" />
                  <div>
                    <p className="font-bold text-sm text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">
                      {t.creatorNickname} · {t.memberCount}/{t.maxMembers} members
                      {t.status === 'PENDING' ? ' · Waiting for members' : ' · In progress'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleJoin(t.id)}
                  disabled={joiningId === t.id}
                  className="px-4 py-1.5 bg-teal-500 text-white rounded-full text-sm font-bold hover:bg-teal-600 transition-colors cursor-pointer border-0 disabled:opacity-50"
                >
                  {joiningId === t.id ? 'Joining...' : 'Join'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
