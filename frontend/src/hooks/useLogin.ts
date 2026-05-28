import { useState } from 'react';
import { supabase } from '../lib/supabase';

/** 从 Supabase 错误中提取可读信息 */
function extractError(err: unknown): string {
  if (!err) return '未知错误';
  if (err instanceof Error) return err.message;
  if (typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    return (obj.message as string) || (obj.msg as string) || (obj.error as string) || JSON.stringify(err);
  }
  return String(err);
}

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
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      if (error) throw error;
      setLoading(false);
      return true;
    } catch (err) {
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
  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // identities 为空 → 已注册邮箱
      if (data.user?.identities && data.user.identities.length === 0) {
        setError('该邮箱已注册，请直接登录');
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (err) {
      setError(extractError(err) || '注册失败');
      setLoading(false);
      return false;
    }
  };

  const clearError = () => setError(null);

  return { loading, error, sendOTP, verifyOTP, signInWithPassword, signUp, clearError };
}
