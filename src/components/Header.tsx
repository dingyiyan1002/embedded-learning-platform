import React, { memo } from 'react';
import { Home, BarChart3, FlaskConical, Keyboard, FolderCode, Trophy } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ViewType } from '@/types';

interface HeaderProps {
  isDarkMode: boolean;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onToggleTheme: () => void;
  accuracy: number;
  gccConnected: boolean;
}

const navItems: Array<{ view: ViewType; label: string; icon: React.ReactNode }> = [
  { view: 'home', label: '首页', icon: <Home className="w-4 h-4" /> },
  { view: 'projects', label: '项目', icon: <FolderCode className="w-4 h-4" /> },
  { view: 'stats', label: '统计', icon: <BarChart3 className="w-4 h-4" /> },
  { view: 'lab', label: '实验室', icon: <FlaskConical className="w-4 h-4" /> },
  { view: 'typing', label: '跟打', icon: <Keyboard className="w-4 h-4" /> },
];

export const Header: React.FC<HeaderProps> = memo(({
  isDarkMode, currentView, onNavigate, onToggleTheme, accuracy, gccConnected,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-lg hidden sm:inline">嵌入式学习平台</span>
          <span className="font-bold text-lg sm:hidden">嵌入式</span>
        </button>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                currentView === item.view
                  ? 'bg-amber-500/20 text-amber-400 font-medium'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* GCC Status */}
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${gccConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs hidden sm:inline opacity-50">
              GCC {gccConnected ? '在线' : '离线'}
            </span>
          </div>

          {/* Accuracy badge */}
          {accuracy > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              {accuracy}%
            </span>
          )}

          <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
});
Header.displayName = 'Header';
