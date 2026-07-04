import { useState, useEffect, useCallback } from 'react';
import { supabase, ADMIN_PHONE, ADMIN_PASSWORD } from '@/utils/supabase';

export interface AuthState {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        setAuthState({
          isLoggedIn: !!data.session,
          loading: false,
          error: null,
        });
      } else {
        const storedToken = localStorage.getItem('recipe_admin_token');
        setAuthState({
          isLoggedIn: !!storedToken,
          loading: false,
          error: null,
        });
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    if (phone !== ADMIN_PHONE || password !== ADMIN_PASSWORD) {
      setAuthState({
        isLoggedIn: false,
        loading: false,
        error: '账号或密码错误',
      });
      return false;
    }

    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: `${phone}@example.com`,
          password,
        });
        if (error) {
          setAuthState({
            isLoggedIn: false,
            loading: false,
            error: '登录失败，请重试',
          });
          return false;
        }
        setAuthState({
          isLoggedIn: true,
          loading: false,
          error: null,
        });
        return true;
      } catch {
        setAuthState({
          isLoggedIn: false,
          loading: false,
          error: '登录失败，请重试',
        });
        return false;
      }
    } else {
      localStorage.setItem('recipe_admin_token', 'admin_token');
      setAuthState({
        isLoggedIn: true,
        loading: false,
        error: null,
      });
      return true;
    }
  }, []);

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('recipe_admin_token');
    }
    setAuthState({
      isLoggedIn: false,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...authState,
    login,
    logout,
  };
};