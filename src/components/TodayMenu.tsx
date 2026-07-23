import { useEffect, useState, useMemo } from 'react';
import { Calendar, ClipboardList, Loader2, ChefHat, ArrowLeft, List, Trash2, Check, ShoppingBag, CheckCircle2, Circle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import { MenuItem, Recipe } from '@/types';

interface TodayMenuPageProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  getToken: () => string | null;
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  onViewRecipe: (recipe: Recipe) => void;
  onCloseRecipe: () => void;
}

export const TodayMenuPage = ({
  isLoggedIn,
  isAdmin,
  getToken,
  recipes,
  selectedRecipe,
  onViewRecipe,
  onCloseRecipe,
}: TodayMenuPageProps) => {
  const { menuItems, menuLoading, fetchMenu, removeFromMenu, updateMenuStatus } = useMenu(getToken);
  const today = new Date().toISOString().slice(0, 10);
  const formattedDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const [viewTab, setViewTab] = useState<'list' | 'detail'>('list');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isLoggedIn) fetchMenu(today);
  }, [isLoggedIn]);

  const handleDelete = async (item: MenuItem) => {
    await removeFromMenu(item.id);
    fetchMenu(today);
  };

  const handleViewRecipe = (item: MenuItem) => {
    const recipe = recipes.find(r => r.id === item.recipe_id);
    if (recipe) {
      onViewRecipe(recipe);
      setViewTab('detail');
    }
  };

  useEffect(() => {
    if (!selectedRecipe) setViewTab('list');
  }, [selectedRecipe]);

  const handleToggleIngredient = (item: MenuItem, ingredient: string, current: boolean) => {
    updateMenuStatus(item.id, { ingredient, purchased: !current });
  };

  const handleAllReady = (item: MenuItem) => {
    updateMenuStatus(item.id, { all_ingredients_ready: !item.all_ingredients_ready });
  };

  const handleComplete = (item: MenuItem) => {
    updateMenuStatus(item.id, { completed: !item.completed });
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const menuRecipes = useMemo(() => {
    const recipeMap = new Map(recipes.map(r => [r.id, r]));
    return menuItems.map(item => ({
      ...item,
      recipe: recipeMap.get(item.recipe_id),
    }));
  }, [menuItems, recipes]);

  const groupedByUser: Record<string, typeof menuRecipes> = {};
  menuRecipes.forEach(item => {
    if (!groupedByUser[item.username]) groupedByUser[item.username] = [];
    groupedByUser[item.username].push(item);
  });

  if (!isLoggedIn) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">请先登录</p>
        <p className="text-gray-400 text-sm mt-2">登录后可查看和管理今日菜单</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {viewTab === 'detail' && selectedRecipe ? (
            <button
              onClick={() => { onCloseRecipe(); setViewTab('list'); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              返回菜单
            </button>
          ) : (
            <>
              <ClipboardList className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-800">今日菜单</h2>
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {viewTab === 'detail' && selectedRecipe ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="relative h-64 md:h-80">
            <img src={selectedRecipe.image_url} alt={selectedRecipe.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <span className="px-3 py-1 bg-lightgreen/90 text-gray-800 rounded-full text-sm font-medium">{selectedRecipe.category}</span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{selectedRecipe.name}</h3>
            <div className="flex items-center gap-6 mb-6 text-gray-600 text-sm">
              <span>准备: {selectedRecipe.prep_time}分钟</span>
              <span>烹饪: {selectedRecipe.cook_time}分钟</span>
            </div>
            <div className="mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3">配料清单</h4>
              <ul className="space-y-2">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <span className="w-5 h-5 bg-lightgreen/20 text-lightgreen rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">{i + 1}</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-3">烹饪步骤</h4>
              <ol className="space-y-3">
                {selectedRecipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-7 h-7 bg-lightgreen text-gray-800 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">{i + 1}</span>
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setViewTab('list')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewTab === 'list' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <List className="w-4 h-4" />菜单列表
            </button>
          </div>

          {menuLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3"><ChefHat className="w-8 h-8 text-orange-300" /></div>
              <p className="text-gray-500">今天还没有人点菜</p>
              <p className="text-gray-400 text-sm mt-1">去首页挑选喜欢的菜吧~</p>
            </div>
          ) : isAdmin ? (
            <div className="space-y-6">
              {Object.entries(groupedByUser).map(([username, items]) => (
                <div key={username} className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">{username.charAt(0)}</span>
                    {username}
                    <span className="text-gray-400 font-normal">· {items.length}道菜</span>
                  </h3>
                  <div className="space-y-3">
                    {items.map(item => {
                      const isExpanded = expandedItems.has(item.id);
                      const ings = item.ingredients_status ? Object.entries(item.ingredients_status) : [];
                      const boughtCount = ings.filter(([, v]) => v).length;
                      const hasIngredients = ings.length > 0;

                      return (
                        <div key={item.id} className={`border rounded-xl overflow-hidden transition-all ${item.completed ? 'border-green-300 bg-green-50/30' : 'border-gray-100'}`}>
                          {/* Dish header row */}
                          <div className="flex items-center gap-3 px-4 py-3">
                            {/* Completed checkbox */}
                            <button
                              onClick={() => handleComplete(item)}
                              className="flex-shrink-0"
                              title={item.completed ? '已完成' : '标记完成'}
                            >
                              {item.completed ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-300 hover:text-green-400 transition-colors" />
                              )}
                            </button>

                            {/* Dish name */}
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleViewRecipe(item)}>
                              <span className={`font-medium truncate block ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700 hover:text-orange-600'}`}>
                                {item.recipe_name}
                              </span>
                            </div>

                            {/* Ingredient summary */}
                            {hasIngredients && (
                              <span className={`text-xs flex-shrink-0 ${boughtCount === ings.length ? 'text-green-500' : 'text-orange-500'}`}>
                                <ShoppingBag className="w-3.5 h-3.5 inline mr-0.5" />
                                {boughtCount}/{ings.length}
                              </span>
                            )}

                            {/* Expand button */}
                            {hasIngredients && (
                              <button onClick={() => toggleExpand(item.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            )}

                            {/* Delete */}
                            <button onClick={() => handleDelete(item)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0" title="移除">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Expanded ingredient list */}
                          {isExpanded && hasIngredients && (
                            <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                                {ings.map(([ing, purchased]) => (
                                  <label key={ing} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${purchased ? 'bg-green-50 text-green-700' : 'hover:bg-white text-gray-600'}`}>
                                    <input
                                      type="checkbox"
                                      checked={purchased}
                                      onChange={() => handleToggleIngredient(item, ing, purchased)}
                                      className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
                                    />
                                    <span className={`text-sm truncate ${purchased ? 'line-through' : ''}`}>{ing}</span>
                                  </label>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                                <label className={`flex items-center gap-2 cursor-pointer text-sm font-medium ${item.all_ingredients_ready ? 'text-green-600' : 'text-gray-500'}`}>
                                  <input
                                    type="checkbox"
                                    checked={!!item.all_ingredients_ready}
                                    onChange={() => handleAllReady(item)}
                                    className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
                                  />
                                  全部备齐
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Normal user view with status */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {menuRecipes.map(item => {
                const ings = item.ingredients_status ? Object.entries(item.ingredients_status) : [];
                const boughtCount = ings.filter(([, v]) => v).length;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleViewRecipe(item)}
                    className={`rounded-xl border transition-all cursor-pointer overflow-hidden ${item.completed ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-white hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      {item.recipe?.image_url && (
                        <img src={item.recipe.image_url} alt={item.recipe_name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className={`font-medium truncate block ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                          {item.recipe_name}
                        </span>
                        {ings.length > 0 && (
                          <span className={`text-xs ${item.completed ? 'text-green-500' : boughtCount === ings.length ? 'text-green-500' : 'text-orange-400'}`}>
                            {item.completed ? '已完成' : `原材料 ${boughtCount}/${ings.length}`}
                          </span>
                        )}
                      </div>
                      {item.completed && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};