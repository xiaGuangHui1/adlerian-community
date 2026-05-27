export interface UserProfile {
  id: string;
  nickname: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  author: Author;
  createdAt: string;
  updatedAt: string;
  encouragementCount: number;
  commentCount: number;
  viewCount: number;
}

export interface Author {
  id: string;
  nickname: string;
  avatarUrl?: string;
}

export interface Comment {
  id: number;
  content: string;
  author: Author;
  parentId?: number;
  createdAt: string;
  replies: Comment[];
  encouragementCount: number;
}

export interface Encouragement {
  id: number;
  sender?: Author;
  message: string;
  anonymous: boolean;
  createdAt: string;
}

export interface CheckIn {
  id: number;
  checkinDate: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGroup {
  id: number;
  name: string;
  description?: string;
  category?: string;
  maxMembers: number;
  currentMembers: number;
  creator: Author;
  createdAt: string;
  joined: boolean;
}

export interface Resource {
  id: number;
  title: string;
  description?: string;
  type: string;
  content?: string;
  coverUrl?: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export const CATEGORIES = [
  { value: 'life-courage', label: '生活勇气', icon: '💪', desc: '在日常中寻找勇气，面对生活的小挑战' },
  { value: 'relationships', label: '人际关系', icon: '🤝', desc: '用课题分离和横向关系重塑人际交往' },
  { value: 'self-acceptance', label: '自我接纳', icon: '💝', desc: '接纳不完美的自己，从自卑走向超越' },
  { value: 'work-meaning', label: '工作意义', icon: '💼', desc: '在平凡工作中寻找对他人的贡献感' },
  { value: 'emotional-confusion', label: '情感困惑', icon: '💭', desc: '在亲密关系中探索真正的信赖与爱' },
  { value: 'other', label: '其他', icon: '💬', desc: '不限主题，自由讨论与实践分享' },
] as const;

export interface Quote {
  id: number;
  content: string;
  author?: string;
  source?: string;
  createdAt: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  targetCount: number;
  icon?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  createdAt: string;
  enrolled: boolean;
  progress: number;
  completed: boolean;
}

export interface HomeStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalEncouragements: number;
  todayCheckIns: number;
}

export interface ActivityItem {
  type: string;
  description: string;
  title?: string;
  targetId: number;
  createdAt: string;
}

export interface InviteStats {
  totalUsers: number;
  totalPosts: number;
  totalEncouragements: number;
  todayCheckIns: number;
  activeChallengeCount: number;
}

export interface TeamInfo {
  id: number;
  inviteCode?: string;
  name: string;
  checkInTime: string;
  memberCount: number;
  maxMembers: number;
  status: 'PENDING' | 'ACTIVE' | 'DISBANDED';
  todayAllCheckedIn: boolean;
  togetherDays: number;
  totalCheckIns: number;
  members: TeamMemberInfo[];
  recentActivities: RecentActivity[];
  createdAt: string;
  activatedAt?: string;
}

export interface TeamMemberInfo {
  userId: string;
  nickname: string;
  avatarUrl?: string;
  isCreator: boolean;
  todayCheckedIn: boolean;
  todayContent?: string;
  isMe: boolean;
  joinedAt: string;
}

export interface RecentActivity {
  userId: string;
  nickname: string;
  content: string;
  createdAt: string;
  relativeTime: string;
}

export interface TeamInvitation {
  code: string;
  creatorNickname: string;
  status: string;
  memberCount: number;
  maxMembers: number;
}

export interface CreateTeamResponse {
  inviteCode: string;
  shareUrl: string;
}
