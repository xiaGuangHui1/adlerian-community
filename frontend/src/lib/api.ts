import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

const getPathname = (url?: string) => {
  if (!url) return '';
  try {
    return new URL(url, 'http://localhost').pathname;
  } catch {
    return url.split('?')[0];
  }
};

const isPublicGet = (method: string | undefined, url?: string) => {
  if ((method ?? 'get').toLowerCase() !== 'get') return false;

  const path = getPathname(url);
  if (path === '/users/me') return false;

  return (
    path === '/home/stats' ||
    path.startsWith('/home/') ||
    path === '/posts' ||
    path.startsWith('/posts/') ||
    path === '/resources' ||
    path.startsWith('/resources/') ||
    path === '/quotes' ||
    path.startsWith('/quotes/') ||
    path === '/challenges' ||
    path === '/categories' ||
    path === '/journals/public' ||
    path === '/groups' ||
    path === '/circles' ||
    path.startsWith('/circles/') ||
    path === '/encouragements' ||
    path.startsWith('/teams/invitation/') ||
    (path.startsWith('/users/') && path !== '/users/me')
  );
};

api.interceptors.request.use(async (config) => {
  if (isPublicGet(config.method, config.url)) {
    return config;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default api;
