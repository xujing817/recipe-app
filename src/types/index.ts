export interface Recipe {
  id: string;
  name: string;
  category: string;
  image_url: string;
  ingredients: string[];
  steps: string[];
  prep_time: number;
  cook_time: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  role: 'super_admin' | 'admin' | 'user';
  created_at: string;
}

export interface MenuItem {
  id: string;
  recipe_id: string;
  recipe_name: string;
  user_id: string;
  username: string;
  note?: string;
  date: string;
  created_at: string;
  ingredients_status?: Record<string, boolean>;
  all_ingredients_ready?: boolean;
  completed?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RecipeFormData {
  name: string;
  category: string;
  image: File | null;
  ingredients: string[];
  steps: string[];
  prep_time: number;
  cook_time: number;
}