import { Category } from '@/types';
import { ChefHat } from 'lucide-react';

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  isMobile?: boolean;
}

export const Sidebar = ({ categories, selectedCategory, onSelectCategory, isMobile = false }: SidebarProps) => {
  const allCategories = ['全部', ...categories.map(c => c.name)];

  if (isMobile) {
    return (
      <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide">
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-full text-base whitespace-nowrap transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-lightgreen text-gray-800 font-medium shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    );
  }

  return (
    <aside className="w-56 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-0 z-10 hidden lg:block">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-lightgreen rounded-xl flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-gray-800" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">智能菜谱</h1>
        </div>

        <nav className="space-y-1">
          <p className="text-sm text-gray-400 mb-3 font-medium">菜类分类</p>
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`w-full px-4 py-3 rounded-xl text-left text-base transition-all duration-300 flex items-center ${
                selectedCategory === category
                  ? 'bg-lightgreen text-gray-800 font-medium shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full mr-3 bg-lightgreen"></span>
              {category}
            </button>
          ))}
        </nav>

        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-500 leading-relaxed">
            点击左侧分类筛选菜谱，或使用顶部搜索框搜索菜谱名称和配料。
          </p>
        </div>
      </div>
    </aside>
  );
};