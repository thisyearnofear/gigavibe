
import { Mic, Play, BarChart, Settings } from 'lucide-react';

interface BottomNavigationProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

const BottomNavigation = ({ activeScreen, setActiveScreen }: BottomNavigationProps) => {
  const navItems = [
    { id: 'tuner', label: 'Tuner', icon: Mic },
    { id: 'practice', label: 'Practice', icon: Play },
    { id: 'progress', label: 'Progress', icon: BarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white/90 backdrop-blur-lg border-t border-slate-200/50 px-4 py-3 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
