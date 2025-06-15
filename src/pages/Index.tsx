import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import TunerScreen from '@/components/TunerScreen';
import PracticeScreen from '@/components/PracticeScreen';
import ProgressScreen from '@/components/ProgressScreen';
import SettingsScreen from '@/components/SettingsScreen';

const Index = () => {
  const [activeScreen, setActiveScreen] = useState('tuner');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'tuner':
        return <TunerScreen />;
      case 'practice':
        return <PracticeScreen />;
      case 'progress':
        return <ProgressScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <TunerScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col max-w-md mx-auto relative">
      <Header />
      
      {/* AI Chat Button */}
      <div className="absolute top-4 right-4 z-10">
        <Link 
          to="/ai-chat"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center gap-2"
        >
          <Bot className="w-5 h-5" />
        </Link>
      </div>

      <main className="flex-1 px-4 py-2 overflow-y-auto pb-20">
        <div className="max-w-sm mx-auto">
          {renderScreen()}
        </div>
      </main>
      <BottomNavigation activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </div>
  );
};

export default Index;
