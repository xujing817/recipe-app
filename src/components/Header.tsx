import { User, LogOut, Plus, ChefHat, Users, ClipboardList, Home } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onAddRecipe: () => void;
  onUserManagement: () => void;
  onTodayMenu: () => void;
  currentView: 'recipes' | 'menu';
  onViewChange: (view: 'recipes' | 'menu') => void;
}

export const Header = ({ isLoggedIn, isAdmin, onLogin, onLogout, onAddRecipe, onUserManagement, onTodayMenu, currentView, onViewChange }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="w-10 h-10 bg-lightgreen rounded-xl flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-gray-800" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">智能菜谱</h1>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* View switcher tabs */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1 mr-2">
                <button
                  onClick={() => onViewChange('recipes')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'recipes'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">菜谱浏览</span>
                </button>
                <button
                  onClick={() => onViewChange('menu')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'menu'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span className="hidden sm:inline">今日菜单</span>
                </button>
              </div>

              {isAdmin && currentView === 'recipes' && (
                <>
                  <button
                    onClick={onAddRecipe}
                    className="flex items-center gap-1.5 px-3 py-2 bg-lightgreen text-gray-800 font-medium rounded-xl hover:bg-green-300 transition-all duration-300 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">添加菜谱</span>
                  </button>
                  <button
                    onClick={onUserManagement}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-700 font-medium rounded-xl hover:bg-blue-200 transition-all duration-300 text-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">用户管理</span>
                  </button>
                </>
              )}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">退出</span>
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
