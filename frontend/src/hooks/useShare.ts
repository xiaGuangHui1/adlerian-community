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
      return `${profile.nickname}邀请你一起练习阿德勒心理学！在这里，我们找回勇气，练习课题分离，建立横向关系。一起加入阿德勒心理学社区~`;
    }
    return '来陪我一起练习阿德勒心理学！在这里，我们找回勇气，练习课题分离，建立横向关系。加入阿德勒心理学社区之旅~';
  };

  const shareOrCopy = async () => {
    const shareUrl = getShareUrl();
    const shareText = getShareText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: '和我组队打卡 | 阿德勒心理学社区',
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
      throw new Error('分享失败，请手动复制链接');
    }
  };

  const shareTeam = async (inviteCode: string, teamName: string) => {
    const base = window.location.origin;
    const shareUrl = `${base}/invite?team=${inviteCode}`;
    const shareText = profile?.nickname
      ? `${profile.nickname}邀请你加入「${teamName}」，一起组队打卡练习勇气！`
      : `有人邀请你加入「${teamName}」，一起组队打卡练习勇气！`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '加入我的队伍 | 阿德勒心理学社区',
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
      throw new Error('分享失败，请手动复制链接');
    }
  };

  return { shareUrl: getShareUrl(), shareOrCopy, copied, shareTeam };
}
