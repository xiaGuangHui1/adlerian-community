import { useState } from 'react';
import { supabase } from '../lib/supabase';

/** 翻译 Supabase 常见错误为中文 */
function translateError(message: string): string {
  if (message.includes('rate limit') || message.includes('only request this after') || message.includes('security purposes')) {
    return '操作太频繁，请稍后再试';
  }
  if (message.includes('Invalid login credentials')) {
    return '邮箱或密码错误';
  }
  if (message.includes('token has expired') || message.includes('expired')) {
    return '验证码已过期，请重新获取';
  }
  if (message.includes('token is invalid')) {
    return '验证码错误，请检查后重试';
  }
  if (message.includes('already registered') || message.includes('already exists')) {
    return '该邮箱已注册，请直接登录';
  }
  if (message.includes('Email not confirmed')) {
    return '邮箱未验证，请查收验证邮件';
  }
  return message;
}

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOTP = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setLoading(false);
      return true;
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : '发送失败'));
      setLoading(false);
      return false;
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      if (error) throw error;
      setLoading(false);
      return true;
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : '验证失败'));
      setLoading(false);
      return false;
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setLoading(false);
      return true;
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : '登录失败'));
      setLoading(false);
      return false;
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // Supabase 对已注册邮箱返回空 identities
      if (data.user?.identities && data.user.identities.length === 0) {
        setError('该邮箱已注册，请直接登录');
        setLoading(false);
        return false;
      }
      setLoading(false);
      return true;
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : '注册失败'));
      setLoading(false);
      return false;
    }
  };

  const clearError = () => setError(null);

  return { loading, error, sendOTP, verifyOTP, signInWithPassword, signUp, clearError };
}
