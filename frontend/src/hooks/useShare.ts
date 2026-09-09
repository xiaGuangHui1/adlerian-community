import { useState } from 'react';
import { useAuth } from './useAuth';

export function useShare() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    const base = window.location.origin;
    if (profile?.id) {
      return `${base}/invite?ref=${profile.id}`;
    }
    return `${base}/invite`;
  };

  const getShareText = () => {
    if (profile?.nickname) {
      return `${profile.nickname} invites you to practice Adlerian psychology! Here we reclaim courage, practice separation of tasks, and build horizontal relationships. Join the Adlerian Community!`;
    }
    return 'Join me in practicing Adlerian psychology! Here we reclaim courage, practice separation of tasks, and build horizontal relationships. Join the Adlerian Community!';
  };

  const shareOrCopy = async () => {
    const shareUrl = getShareUrl();
    const shareText = getShareText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Team up with me | Adlerian Community',
          text: shareText,
          url: shareUrl,
        });
        return { method: 'share' as const };
      } catch {
        // 用户取消或 API 不支持 — 回退到复制
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return { method: 'copy' as const };
    } catch {
      throw new Error('Share failed, please copy the link manually');
    }
  };

  const shareTeam = async (inviteCode: string, teamName: string) => {
    const base = window.location.origin;
    const shareUrl = `${base}/invite?team=${inviteCode}`;
    const shareText = profile?.nickname
      ? `${profile.nickname} invites you to join "${teamName}" to practice courage together!`
      : `Someone invites you to join "${teamName}" to practice courage together!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my team | Adlerian Community',
          text: shareText,
          url: shareUrl,
        });
        return { method: 'share' as const };
      } catch {
        // 回退到复制
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return { method: 'copy' as const };
    } catch {
      throw new Error('Share failed, please copy the link manually');
    }
  };

  return { shareUrl: getShareUrl(), shareOrCopy, copied, shareTeam };
}
