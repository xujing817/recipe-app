import { Recipe } from '@/types';
import { Clock, ChefHat, ShoppingCart } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onOrder?: () => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  ordered?: boolean;
}

export const RecipeCard = ({ recipe, onClick, onEdit, onDelete, onOrder, isLoggedIn = false, isAdmin = false, ordered = false }: RecipeCardProps) => {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={recipe.image_url}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700">
          {recipe.category}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-lightgreen transition-colors">
          {recipe.name}
        </h3>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>准备 {formatTime(recipe.prep_time)}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-4 h-4" />
            <span>烹饪 {formatTime(recipe.cook_time)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
            >
              {ingredient.split(' ')[0]}
            </span>
          ))}
          {recipe.ingredients.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
              +{recipe.ingredients.length - 3}种
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {isLoggedIn && onOrder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOrder();
              }}
              disabled={ordered}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                ordered
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {ordered ? '已点' : '点菜'}
            </button>
          )}
          {isAdmin && onEdit && onDelete && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="flex-1 py-2 bg-lightgreen/20 text-gray-700 rounded-lg text-sm font-medium hover:bg-lightgreen/30 transition-colors"
              >
                编辑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="flex-1 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                删除
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
