import { useState } from 'react';
import { supabase } from '../lib/supabase';

/** 翻译 Supabase 常见错误为中文 */
function translateError(message: string): string {
  if (message.includes('rate limit')) {
    return '邮件发送太频繁，请稍后再试';
  }
  if (message.includes('already registered') || message.includes('already exists')) {
    return '该邮箱已注册，请直接登录';
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
  if (message.includes('only request this after') || message.includes('security purposes')) {
    return '操作太频繁，请稍后再试';
  }
  return message;
}

/** 从 Supabase 错误中提取可读信息 */
function extractError(err: unknown): string {
  if (!err) return '未知错误';
  if (err instanceof Error) return translateError(err.message);
  if (typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    const msg = (obj.message as string) || (obj.msg as string) || (obj.error as string);
    return msg ? translateError(msg) : JSON.stringify(err);
  }
  return String(err);
}

function isAlreadyRegisteredError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const obj = err as Record<string, unknown>;
  const message = String(obj.message || obj.msg || obj.error || '');
  return message.includes('already registered') || message.includes('already exists');
}

export type SignUpResult = 'created' | 'already_registered' | 'failed';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 发送验证码到邮箱 */
  const sendOTP = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setLoading(false);
      return true;
    } catch (err) {
      console.error('[sendOTP] error:', err);
      setError(extractError(err) || '发送失败');
      setLoading(false);
      return false;
    }
  };

  /** 验证 OTP 验证码并登录 */
  const verifyOTP = async (email: string, token: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      if (error) throw error;

      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('登录状态建立失败，请重新输入验证码');
      }

      setLoading(false);
      return true;
    } catch (err) {
      console.error('[verifyOTP] error:', err);
      setError(extractError(err) || '验证失败');
      setLoading(false);
      return false;
    }
  };

  /** 邮箱密码登录 */
  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setLoading(false);
      return true;
    } catch (err) {
      console.error('[signInWithPassword] error:', err);
      setError(extractError(err) || '登录失败');
      setLoading(false);
      return false;
    }
  };

  /** 邮箱密码注册
   *
   * 重复注册检测：Supabase signUp 对已注册邮箱不抛错，
   * 返回占位 user（identities 为空数组），需前端自行判断
   */
  const signUp = async (email: string, password: string): Promise<SignUpResult> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // identities 为空 → 已注册邮箱
      if (data.user?.identities && data.user.identities.length === 0) {
        setLoading(false);
        return 'already_registered';
      }

      setLoading(false);
      return 'created';
    } catch (err) {
      console.error('[signUp] error:', err);
      if (isAlreadyRegisteredError(err)) {
        setLoading(false);
        return 'already_registered';
      }
      setError(extractError(err) || '注册失败');
      setLoading(false);
      return 'failed';
    }
  };

  const clearError = () => setError(null);

  return { loading, error, sendOTP, verifyOTP, signInWithPassword, signUp, clearError };
}
