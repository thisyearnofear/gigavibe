
import { Mic } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white/20 backdrop-blur-md border-b border-white/20 px-4 py-4 shadow-lg">
      <div className="flex items-center justify-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
          <Mic className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          GIGAVIBE VocalAI Coach
        </h1>
      </div>
    </header>
  );
};

export default Header;
