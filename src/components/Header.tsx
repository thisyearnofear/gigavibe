
import { Mic } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-center gap-3 max-w-sm mx-auto">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
          <Mic className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          GIGAVIBE VocalAI Coach
        </h1>
      </div>
    </header>
  );
};

export default Header;
