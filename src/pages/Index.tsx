
import { useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex flex-col">
      <Header />
      <Navigation activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        {renderScreen()}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
