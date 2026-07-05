import { useState, useCallback, useEffect } from 'react';
import { Recipe, Category, RecipeFormData } from '@/types';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [recipesRes, categoriesRes] = await Promise.all([
        fetch('/api/recipes'),
        fetch('/api/categories'),
      ]);

      if (!recipesRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const recipesData = await recipesRes.json();
      const categoriesData = await categoriesRes.json();

      setRecipes(recipesData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.warn('API connection failed');
      setRecipes([]);
      setCategories([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addRecipe = useCallback(async (formData: RecipeFormData): Promise<boolean> => {
    setError(null);

    let imageUrl = '';
    if (formData.image) {
      imageUrl = URL.createObjectURL(formData.image);
    }

    const newRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'> = {
      name: formData.name,
      category: formData.category,
      image_url: imageUrl,
      ingredients: formData.ingredients,
      steps: formData.steps,
      prep_time: formData.prep_time,
      cook_time: formData.cook_time,
    };

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecipe),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '添加失败');
        return false;
      }

      await fetchData();
      return true;
    } catch {
      setError('添加失败');
      return false;
    }
  }, [fetchData]);

  const updateRecipe = useCallback(async (id: string, formData: RecipeFormData): Promise<boolean> => {
    setError(null);

    let imageUrl = '';
    if (formData.image) {
      imageUrl = URL.createObjectURL(formData.image);
    }

    const updateData: Partial<Recipe> = {
      name: formData.name,
      category: formData.category,
      ingredients: formData.ingredients,
      steps: formData.steps,
      prep_time: formData.prep_time,
      cook_time: formData.cook_time,
      updated_at: new Date().toISOString(),
    };

    if (imageUrl) {
      updateData.image_url = imageUrl;
    }

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '更新失败');
        return false;
      }

      await fetchData();
      return true;
    } catch {
      setError('更新失败');
      return false;
    }
  }, [fetchData]);

  const deleteRecipe = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '删除失败');
        return false;
      }

      await fetchData();
      return true;
    } catch {
      setError('删除失败');
      return false;
    }
  }, [fetchData]);

  const searchRecipes = useCallback((keyword: string): Recipe[] => {
    if (!keyword.trim()) return recipes;

    const lowerKeyword = keyword.toLowerCase();
    return recipes.filter(
      recipe =>
        recipe.name.toLowerCase().includes(lowerKeyword) ||
        recipe.ingredients.some(ingredient =>
          ingredient.toLowerCase().includes(lowerKeyword)
        )
    );
  }, [recipes]);

  const filterByCategory = useCallback((category: string): Recipe[] => {
    if (!category || category === '全部') return recipes;
    return recipes.filter(recipe => recipe.category === category);
  }, [recipes]);

  const getRecipeById = useCallback((id: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  return {
    recipes,
    categories,
    loading,
    error,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    searchRecipes,
    filterByCategory,
    getRecipeById,
  };
};