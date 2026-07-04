import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeDetail } from '@/components/RecipeDetail';
import { LoginModal } from '@/components/LoginModal';
import { RecipeForm } from '@/components/RecipeForm';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe } from '@/types';
import { ChefHat, Loader2 } from 'lucide-react';

function App() {
  const { isLoggedIn, loading: authLoading, login, logout, error: authError } = useAuth();
  const { recipes, categories, loading, addRecipe, updateRecipe, deleteRecipe, searchRecipes, filterByCategory, getRecipeById } = useRecipes();
  
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredRecipes = useMemo(() => {
    let result = filterByCategory(selectedCategory);
    result = searchRecipes(searchKeyword);
    return result;
  }, [selectedCategory, searchKeyword, filterByCategory, searchRecipes]);

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsFormOpen(true);
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (confirm(`确定要删除菜谱 "${recipe.name}" 吗？`)) {
      await deleteRecipe(recipe.id);
    }
  };

  const handleAddRecipe = () => {
    setEditingRecipe(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    category: string;
    image: File | null;
    ingredients: string[];
    steps: string[];
    prep_time: number;
    cook_time: number;
  }) => {
    if (editingRecipe) {
      return await updateRecipe(editingRecipe.id, data);
    }
    return await addRecipe(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-lightgreen animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        categories={categories} 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        isMobile={isMobile}
      />

      <main className={`${isMobile ? '' : 'lg:ml-56'}`}>
        <Header
          isLoggedIn={isLoggedIn}
          onLogin={() => setIsLoginModalOpen(true)}
          onLogout={logout}
          onAddRecipe={handleAddRecipe}
        />

        <div className="p-6">
          <div className="mb-6">
            <SearchBar onSearch={setSearchKeyword} />
          </div>

          {isMobile && (
            <div className="mb-6">
              <Sidebar 
                categories={categories} 
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                isMobile={true}
              />
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {selectedCategory === '全部' ? '全部菜谱' : selectedCategory}
              <span className="text-gray-400 font-normal ml-2">({filteredRecipes.length}道)</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-lightgreen animate-spin" />
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">暂无菜谱</p>
              <p className="text-gray-400 text-sm mt-2">尝试切换分类或调整搜索关键词</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => handleViewRecipe(recipe)}
                  onEdit={() => handleEditRecipe(recipe)}
                  onDelete={() => handleDeleteRecipe(recipe)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
        }}
        onLogin={login}
        loading={authLoading}
        error={authError}
      />

      <RecipeForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecipe(null);
        }}
        onSubmit={handleFormSubmit}
        categories={categories}
        recipe={editingRecipe}
      />
    </div>
  );
}

export default App;