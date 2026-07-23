import { useState, useCallback } from 'react';
import { MenuItem } from '@/types';

export const useMenu = (getToken: () => string | null) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);

  const fetchMenu = useCallback(async (date?: string) => {
    const token = getToken();
    if (!token) return;

    setMenuLoading(true);
    try {
      const queryDate = date || new Date().toISOString().slice(0, 10);
      const response = await fetch(`/api/menu?date=${queryDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMenuItems(data || []);
      }
    } catch {
      console.warn('获取菜单失败');
    }
    setMenuLoading(false);
  }, [getToken]);

  const addToMenu = useCallback(async (recipeId: string, recipeName: string): Promise<{ success: boolean; error?: string }> => {
    const token = getToken();
    if (!token) return { success: false, error: '请先登录' };

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipe_id: recipeId, recipe_name: recipeName }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || '点菜失败' };
      }

      setMenuItems(prev => [...prev, data]);
      return { success: true };
    } catch {
      return { success: false, error: '网络错误' };
    }
  }, [getToken]);

  const removeFromMenu = useCallback(async (menuId: string): Promise<boolean> => {
    const token = getToken();
    if (!token) return false;

    try {
      const response = await fetch(`/api/menu/${menuId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMenuItems(prev => prev.filter(m => m.id !== menuId));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [getToken]);

  const updateMenuStatus = useCallback(async (
    menuId: string,
    data: {
      ingredient?: string;
      purchased?: boolean;
      all_ingredients_ready?: boolean;
      completed?: boolean;
    }
  ): Promise<boolean> => {
    const token = getToken();
    if (!token) return false;

    try {
      const response = await fetch(`/api/menu/${menuId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updated = await response.json();
        setMenuItems(prev => prev.map(m => m.id === menuId ? updated : m));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [getToken]);

  return {
    menuItems,
    menuLoading,
    fetchMenu,
    addToMenu,
    removeFromMenu,
    updateMenuStatus,
  };
};