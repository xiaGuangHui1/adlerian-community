import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

export type ProfileUpdate = Pick<UserProfile, 'nickname'>
  & Partial<Pick<UserProfile, 'avatarUrl' | 'bio'>>;

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  registerProfile: (nickname: string) => Promise<UserProfile>;
  updateProfile: (profile: ProfileUpdate) => Promise<UserProfile>;
  fetchProfile: () => Promise<UserProfile | null>;
}

export const AuthContext = createContext<AuthState | null>(null);
