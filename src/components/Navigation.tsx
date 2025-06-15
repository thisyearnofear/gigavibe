
import { Mic, Play, BarChart, Settings } from 'lucide-react';

interface NavigationProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

const Navigation = ({ activeScreen, setActiveScreen }: NavigationProps) => {
  const navItems = [
    { id: 'tuner', label: 'Tuner', icon: Mic },
    { id: 'practice', label: 'Practice', icon: Play },
    { id: 'progress', label: 'Progress', icon: BarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-br from-purple-400/30 to-pink-400/30 text-purple-700 shadow-lg'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
