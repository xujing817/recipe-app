import { User, LogOut, Plus, ChefHat } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onAddRecipe: () => void;
}

export const Header = ({ isLoggedIn, onLogin, onLogout, onAddRecipe }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="w-10 h-10 bg-lightgreen rounded-xl flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-gray-800" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">智能菜谱</h1>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <button
                onClick={onAddRecipe}
                className="flex items-center gap-2 px-4 py-2 bg-lightgreen text-gray-800 font-medium rounded-xl hover:bg-green-300 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">添加菜谱</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">退出登录</span>
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-4 py-2 bg-lightgreen text-gray-800 font-medium rounded-xl hover:bg-green-300 transition-all duration-300"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">登录</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};