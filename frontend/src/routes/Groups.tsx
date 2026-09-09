import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../lib/api';
import { StudyGroup, PageResponse, CATEGORIES } from '../types';
import { useAuth } from '../hooks/useAuth';

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [maxMembers, setMaxMembers] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const { data } = await api.get<PageResponse<StudyGroup>>('/groups');
      setGroups(data.content);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchGroups();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchGroups]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/groups', { name, description, category, maxMembers });
      setShowCreate(false);
      setName('');
      setDescription('');
      await fetchGroups();
    } catch {
      alert('Failed to create. Please sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (groupId: number) => {
    try {
      await api.post(`/groups/${groupId}/join`);
      await fetchGroups();
    } catch (error: unknown) {
      alert('Failed to join: ' + getErrorMessage(error, 'Please sign in'));
    }
  };

  const handleLeave = async (groupId: number) => {
    try {
      await api.post(`/groups/${groupId}/leave`);
      await fetchGroups();
    } catch (error: unknown) {
      alert('Failed to leave: ' + getErrorMessage(error, 'Please try again later'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-800">Support Groups</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-amber-700 text-white rounded-lg text-sm cursor-pointer border-0 hover:bg-amber-800"
        >
          Create Group
        </button>
      </div>

      <p className="text-sm text-stone-500 mb-6">
        Join like-minded groups to learn and grow together in community. Each group has a member limit to keep things intimate.
      </p>

      {/* 创建小组表单 */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-stone-200 mb-6 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Group name"
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Group description"
            rows={3}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <div className="flex gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              min={2}
              max={50}
              className="w-24 px-3 py-2 border border-stone-200 rounded-lg text-sm"
              placeholder="Max members"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-3 py-2 text-stone-600 bg-transparent border border-stone-200 rounded-lg text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-amber-700 text-white rounded-lg text-sm cursor-pointer border-0 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* 小组列表 */}
      {loading ? (
        <div className="text-center py-12 text-stone-400">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-white p-5 rounded-xl border border-stone-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-stone-800">{group.name}</h3>
                  {group.category && (
                    <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded mt-1 inline-block">
                      {CATEGORIES.find((c) => c.value === group.category)?.label || group.category}
                    </span>
                  )}
                </div>
                <div className="text-xs text-stone-400">
                  {group.currentMembers}/{group.maxMembers} members
                </div>
              </div>
              {group.description && (
                <p className="text-sm text-stone-500 mt-2">{group.description}</p>
              )}
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-stone-400">
                  Creator: {group.creator.nickname}
                </span>
                {user && (
                  group.joined ? (
                    <button
                      onClick={() => handleLeave(group.id)}
                      className="text-xs text-stone-500 border border-stone-200 bg-white px-3 py-1 rounded cursor-pointer hover:bg-stone-50"
                    >
                      Leave
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(group.id)}
                      className="text-xs text-white bg-amber-700 border-0 px-3 py-1 rounded cursor-pointer hover:bg-amber-800"
                    >
                      Join
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="col-span-2 text-center py-12 text-stone-400">
              No groups yet — create the first one
            </div>
          )}
        </div>
      )}
    </div>
  );
}
