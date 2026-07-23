import { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeDetail } from '@/components/RecipeDetail';
import { LoginModal } from '@/components/LoginModal';
import { RecipeForm } from '@/components/RecipeForm';
import { Header } from '@/components/Header';
import { UserManagement } from '@/components/UserManagement';
import { TodayMenuPage } from '@/components/TodayMenu';
import { useAuth } from '@/hooks/useAuth';
import { useRecipes } from '@/hooks/useRecipes';
import { MenuItem } from '@/types';
import { ChefHat, Loader2, ChevronDown } from 'lucide-react';

type Recipe = import('@/types').Recipe;

const PAGE_SIZE = 24;

function App() {
  const { user, isLoggedIn, isAdmin, loading: authLoading, login, logout, error: authError, getToken } = useAuth();
  const { recipes, categories, loading, addRecipe, updateRecipe, deleteRecipe } = useRecipes(getToken);

  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'recipes' | 'menu'>('recipes');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [page, setPage] = useState(1);

  const orderedRecipeIds = useMemo(
    () => new Set(menuItems.map(m => m.recipe_id)),
    [menuItems]
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset page when filter changes
  const handleCategoryChange = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((kw: string) => {
    setSearchKeyword(kw);
    setPage(1);
  }, []);

  const filteredRecipes = useMemo(() => {
    let result = recipes;
    if (selectedCategory && selectedCategory !== '全部') {
      result = result.filter(r => r.category === selectedCategory);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(kw) ||
        r.ingredients.some(i => i.toLowerCase().includes(kw))
      );
    }
    return result;
  }, [recipes, selectedCategory, searchKeyword]);

  // Paginate
  const displayedRecipes = useMemo(
    () => filteredRecipes.slice(0, page * PAGE_SIZE),
    [filteredRecipes, page]
  );

  const hasMore = displayedRecipes.length < filteredRecipes.length;

  const handleViewRecipe = (recipe: Recipe) => setSelectedRecipe(recipe);
  const handleEditRecipe = (recipe: Recipe) => { setEditingRecipe(recipe); setIsFormOpen(true); };
  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (confirm(`确定要删除菜谱"${recipe.name}" 吗？`)) await deleteRecipe(recipe.id);
  };
  const handleAddRecipe = () => { setEditingRecipe(null); setIsFormOpen(true); };
  const handleLogin = async (username: string, password: string) => login(username, password);
  const handleLogout = () => { logout(); setMenuItems([]); };

  const handleOrderRecipe = async (recipe: Recipe) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipe_id: recipe.id, recipe_name: recipe.name }),
      });
      if (res.ok) {
        const newItem = await res.json();
        setMenuItems(prev => [...prev, newItem]);
      } else {
        const data = await res.json();
        alert(data.error || '点菜失败');
      }
    } catch { alert('网络错误'); }
  };

  const handleFormSubmit = async (data: {
    name: string; category: string; image: File | null;
    ingredients: string[]; steps: string[]; prep_time: number; cook_time: number;
  }) => {
    if (editingRecipe) return await updateRecipe(editingRecipe.id, data);
    return await addRecipe(data);
  };

  const handleViewChange = (view: 'recipes' | 'menu') => {
    setCurrentView(view);
    setSelectedRecipe(null);
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
      {!isMobile && (
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          isMobile={false}
        />
      )}

      <main className={isMobile ? '' : 'lg:ml-56'}>
        <Header
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          onLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onAddRecipe={handleAddRecipe}
          onUserManagement={() => setIsUserMgmtOpen(true)}
          onTodayMenu={() => handleViewChange('menu')}
          currentView={currentView}
          onViewChange={handleViewChange}
        />

        <div className="p-6">
          {currentView === 'menu' ? (
            <TodayMenuPage
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              getToken={getToken}
              recipes={recipes}
              selectedRecipe={selectedRecipe}
              onViewRecipe={handleViewRecipe}
              onCloseRecipe={() => setSelectedRecipe(null)}
            />
          ) : (
            <>
              <div className="mb-6"><SearchBar onSearch={handleSearchChange} /></div>

              {isMobile && (
                <div className="mb-6">
                  <Sidebar categories={categories} selectedCategory={selectedCategory} onSelectCategory={handleCategoryChange} isMobile={true} />
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
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onClick={() => handleViewRecipe(recipe)}
                        onEdit={() => handleEditRecipe(recipe)}
                        onDelete={() => handleDeleteRecipe(recipe)}
                        onOrder={() => handleOrderRecipe(recipe)}
                        isLoggedIn={isLoggedIn}
                        isAdmin={isAdmin}
                        ordered={orderedRecipeIds.has(recipe.id)}
                      />
                    ))}
                  </div>
                  {hasMore && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setPage(p => p + 1)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                      >
                        <span>加载更多</span>
                        <span className="text-xs text-gray-400">
                          ({displayedRecipes.length}/{filteredRecipes.length})
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      {selectedRecipe && currentView === 'recipes' && (
        <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} loading={authLoading} error={authError} />

      <RecipeForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingRecipe(null); }}
        onSubmit={handleFormSubmit}
        categories={categories}
        recipe={editingRecipe}
        getToken={getToken}
      />

      <UserManagement isOpen={isUserMgmtOpen} onClose={() => setIsUserMgmtOpen(false)} getToken={getToken} />
    </div>
  );
}

export default App;