import { useState, useCallback, useEffect } from 'react';
import { Recipe, Category, RecipeFormData } from '@/types';
import { supabase, mockRecipes, mockCategories } from '@/utils/supabase';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (supabase) {
        try {
          const [recipesRes, categoriesRes] = await Promise.all([
            supabase.from('recipes').select('*'),
            supabase.from('categories').select('*'),
          ]);

          if (recipesRes.error) throw recipesRes.error;
          if (categoriesRes.error) throw categoriesRes.error;

          setRecipes(recipesRes.data || []);
          setCategories(categoriesRes.data || []);
        } catch (err) {
          console.warn('Supabase connection failed, using mock data');
          setRecipes(mockRecipes);
          setCategories(mockCategories);
        }
      } else {
        setRecipes(mockRecipes);
        setCategories(mockCategories);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const addRecipe = useCallback(async (formData: RecipeFormData): Promise<boolean> => {
    setError(null);

    let imageUrl = '';
    if (formData.image) {
      if (supabase) {
        const fileName = `${Date.now()}-${formData.image.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(fileName, formData.image);

        if (uploadError) {
          setError('图片上传失败');
          return false;
        }

        const { data: urlData } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(fileName);

        imageUrl = urlData?.publicUrl || '';
      } else {
        imageUrl = URL.createObjectURL(formData.image);
      }
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

    if (supabase) {
      const { error: insertError } = await supabase
        .from('recipes')
        .insert([newRecipe]);

      if (insertError) {
        setError('添加失败');
        return false;
      }
    } else {
      setRecipes(prev => [
        {
          ...newRecipe,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    return true;
  }, []);

  const updateRecipe = useCallback(async (id: string, formData: RecipeFormData): Promise<boolean> => {
    setError(null);

    let imageUrl = '';
    if (formData.image) {
      if (supabase) {
        const fileName = `${Date.now()}-${formData.image.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(fileName, formData.image);

        if (uploadError) {
          setError('图片上传失败');
          return false;
        }

        const { data: urlData } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(fileName);

        imageUrl = urlData?.publicUrl || '';
      } else {
        imageUrl = URL.createObjectURL(formData.image);
      }
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

    if (supabase) {
      const { error: updateError } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        setError('更新失败');
        return false;
      }
    } else {
      setRecipes(prev =>
        prev.map(recipe =>
          recipe.id === id ? { ...recipe, ...updateData } : recipe
        )
      );
    }

    return true;
  }, []);

  const deleteRecipe = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    if (supabase) {
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        setError('删除失败');
        return false;
      }
    } else {
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    }

    return true;
  }, []);

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