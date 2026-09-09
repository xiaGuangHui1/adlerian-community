export interface UserProfile {
  id: string;
  nickname: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface CheckInStats {
  totalDays: number;
  streak: number;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  source?: string;
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
  tag?: string;
}

export const COMMENT_TAGS = [
  { value: 'i-experienced-too', label: 'I experienced this too' },
  { value: 'helped-me', label: 'This helped me' },
  { value: 'with-you', label: "I'm with you" },
  { value: 'inspires-me', label: 'Your courage inspires me' },
  { value: 'i-understand', label: 'I understand' },
] as const;

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
  postId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInFeedItem {
  id: number;
  checkinDate: string;
  content: string;
  createdAt: string;
  author: Author;
  encouragementCount: number;
}

export interface Notification {
  id: number;
  type: string;
  actorNickname?: string;
  actorAvatarUrl?: string;
  targetType?: string;
  targetId?: number;
  content?: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: number;
  otherUser: Author;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface Message {
  id: number;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
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
  viewCount: number;
  sortOrder: number;
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
  { value: 'practice-checkin', label: 'Practice Check-in', icon: '📝', desc: 'Record daily practice, share courage and growth' },
  { value: 'parent-child-conflict', label: 'Parent-Child Conflict', desc: 'Improve parent-child communication and resolve family conflict' },
  { value: 'reduce-internal-friction', label: 'Reduce Overthinking', desc: 'Stop self-sabotage and spend energy on what matters' },
  { value: 'enhance-connection', label: 'Build Connection', desc: 'Cultivate belonging and deeper connections' },
  { value: 'life-courage', label: 'Daily Courage', icon: '💪', desc: 'Find courage in everyday life' },
  { value: 'relationships', label: 'Relationships', icon: '🤝', desc: 'Reshape relationships with separation of tasks and horizontal relationships' },
  { value: 'self-acceptance', label: 'Self-Acceptance', icon: '💝', desc: 'Accept your imperfect self and move from inferiority to growth' },
  { value: 'work-meaning', label: 'Meaning in Work', icon: '💼', desc: 'Find a sense of contribution in everyday work' },
  { value: 'emotional-confusion', label: 'Emotional Confusion', icon: '💭', desc: 'Explore true trust and love in relationships' },
  { value: 'work-task', label: 'Work Task', icon: '💼', desc: "One of Adler's three life tasks: realize value through contribution" },
  { value: 'friendship-task', label: 'Friendship Task', icon: '👥', desc: "One of Adler's three life tasks: build horizontal relationships" },
  { value: 'love-task', label: 'Love Task', icon: '❤️', desc: "One of Adler's three life tasks: cooperation and contribution in love" },
  { value: 'other', label: 'Other', icon: '💬', desc: 'Any topic — free discussion and practice sharing' },
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

export interface TeamSummary {
  id: number;
  name: string;
  memberCount: number;
  maxMembers: number;
  creatorNickname: string;
  creatorAvatarUrl?: string;
  status: string;
}

export interface InterestCircle {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  coverUrl?: string;
  sortOrder: number;
  memberCount: number;
  postCount: number;
  createdAt: string;
  joined: boolean;
}

export interface CirclePost {
  id: number;
  title: string;
  content: string;
  author: Author;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}
