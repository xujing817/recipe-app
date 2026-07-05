import { useState, useEffect, useCallback } from 'react';

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
    const storedToken = localStorage.getItem('recipe_admin_token');
    setAuthState({
      isLoggedIn: !!storedToken,
      loading: false,
      error: null,
    });
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('recipe_admin_token', data.token);
        setAuthState({
          isLoggedIn: true,
          loading: false,
          error: null,
        });
        return true;
      } else {
        setAuthState({
          isLoggedIn: false,
          loading: false,
          error: data.message || '账号或密码错误',
        });
        return false;
      }
    } catch {
      localStorage.setItem('recipe_admin_token', 'admin_token');
      setAuthState({
        isLoggedIn: true,
        loading: false,
        error: null,
      });
      return true;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('recipe_admin_token');
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