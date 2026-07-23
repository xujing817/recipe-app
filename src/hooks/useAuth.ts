import { useState, useEffect, useCallback } from 'react';

interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('recipe_token');
    if (!token) {
      setAuthState({ user: null, loading: false, error: null });
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}`  },
      });

      if (!response.ok) {
        localStorage.removeItem('recipe_token');
        setAuthState({ user: null, loading: false, error: null });
        return;
      }

      const user = await response.json();
      setAuthState({ user, loading: false, error: null });
    } catch {
      setAuthState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('recipe_token', data.token);
        setAuthState({
          user: data.user,
          loading: false,
          error: null,
        });
        return true;
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: data.message || '账号或密码错误',
        });
        return false;
      }
    } catch {
      setAuthState({
        user: null,
        loading: false,
        error: '网络错误，请稍后重试',
      });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('recipe_token');
    setAuthState({
      user: null,
      loading: false,
      error: null,
    });
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem('recipe_token');
  }, []);

  return {
    user: authState.user,
    isLoggedIn: !!authState.user,
    isAdmin: authState.user?.role === 'admin',
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    getToken,
  };
};
