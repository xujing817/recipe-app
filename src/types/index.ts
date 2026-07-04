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

export interface LoginCredentials {
  phone: string;
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