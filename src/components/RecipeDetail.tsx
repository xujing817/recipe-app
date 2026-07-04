import { Recipe } from '@/types';
import { X, Clock, ChefHat, ShoppingBag, ListOrdered } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
}

export const RecipeDetail = ({ recipe, onClose }: RecipeDetailProps) => {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      />
      
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-300 hover:scale-110"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        <div className="relative h-64 md:h-80 flex-shrink-0">
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <span className="px-3 py-1 bg-lightgreen/90 text-gray-800 rounded-full text-sm font-medium">
              {recipe.category}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {recipe.name}
          </h2>

          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5 text-lightgreen" />
              <div>
                <p className="text-xs text-gray-400">准备时间</p>
                <p className="text-base font-medium">{formatTime(recipe.prep_time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <ChefHat className="w-5 h-5 text-lightgreen" />
              <div>
                <p className="text-xs text-gray-400">烹饪时间</p>
                <p className="text-base font-medium">{formatTime(recipe.cook_time)}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-5 h-5 text-lightgreen" />
              <h3 className="text-lg font-bold text-gray-800">配料清单</h3>
            </div>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-3 text-base text-gray-600 leading-relaxed"
                >
                  <span className="w-6 h-6 bg-lightgreen/20 text-lightgreen rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    {index + 1}
                  </span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListOrdered className="w-5 h-5 text-lightgreen" />
              <h3 className="text-lg font-bold text-gray-800">烹饪步骤</h3>
            </div>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li 
                  key={index}
                  className="flex gap-4"
                >
                  <span className="w-8 h-8 bg-lightgreen text-gray-800 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-base text-gray-700 leading-relaxed">
                      {step}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};