
import { useState } from 'react';
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
