import { useState, useCallback, useEffect } from 'react';
import { Recipe, Category, RecipeFormData } from '@/types';

export const useRecipes = (getToken: () => string | null) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useCallback(() => {
    const token = getToken();
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }, [getToken]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recipesRes, categoriesRes] = await Promise.all([
        fetch('/api/recipes'),
        fetch('/api/categories'),
      ]);
      if (!recipesRes.ok || !categoriesRes.ok) throw new Error('Failed');
      const recipesData = await recipesRes.json();
      const categoriesData = await categoriesRes.json();
      setRecipes(recipesData || []);
      setCategories(categoriesData || []);
    } catch {
      setRecipes([]);
      setCategories([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addRecipe = useCallback(async (formData: RecipeFormData): Promise<boolean> => {
    setError(null);
    let imageUrl = '';
    if (formData.image) imageUrl = URL.createObjectURL(formData.image);
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: formData.name, category: formData.category,
          image_url: imageUrl, ingredients: formData.ingredients,
          steps: formData.steps, prep_time: formData.prep_time, cook_time: formData.cook_time,
        }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || '添加失败'); return false; }
      await fetchData();
      return true;
    } catch { setError('添加失败'); return false; }
  }, [fetchData, authHeaders]);

  const updateRecipe = useCallback(async (id: string, formData: RecipeFormData): Promise<boolean> => {
    setError(null);
    let imageUrl = '';
    if (formData.image) imageUrl = URL.createObjectURL(formData.image);
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          name: formData.name, category: formData.category,
          image_url: imageUrl || undefined,
          ingredients: formData.ingredients, steps: formData.steps,
          prep_time: formData.prep_time, cook_time: formData.cook_time,
        }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || '更新失败'); return false; }
      await fetchData();
      return true;
    } catch { setError('更新失败'); return false; }
  }, [fetchData, authHeaders]);

  const deleteRecipe = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!response.ok) { const data = await response.json(); setError(data.error || '删除失败'); return false; }
      await fetchData();
      return true;
    } catch { setError('删除失败'); return false; }
  }, [fetchData, authHeaders]);

  const searchRecipes = useCallback((keyword: string): Recipe[] => {
    if (!keyword.trim()) return recipes;
    const kw = keyword.toLowerCase();
    return recipes.filter(r => r.name.toLowerCase().includes(kw) || r.ingredients.some(i => i.toLowerCase().includes(kw)));
  }, [recipes]);

  const filterByCategory = useCallback((category: string): Recipe[] => {
    if (!category || category === '全部') return recipes;
    return recipes.filter(r => r.category === category);
  }, [recipes]);

  const getRecipeById = useCallback((id: string): Recipe | undefined => {
    return recipes.find(r => r.id === id);
  }, [recipes]);

  return { recipes, categories, loading, error, addRecipe, updateRecipe, deleteRecipe, searchRecipes, filterByCategory, getRecipeById, fetchData };
};
