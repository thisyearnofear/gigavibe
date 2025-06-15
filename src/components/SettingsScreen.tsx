
import { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    sensitivity: 75,
    tuningStandard: 440,
    theme: 'auto',
    notifications: true,
    vibration: true,
    autoRecord: false,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const adjustValue = (key: string, delta: number) => {
    const current = settings[key as keyof typeof settings] as number;
    const newValue = Math.max(0, Math.min(100, current + delta));
    updateSetting(key, newValue);
  };

  return (
    <div className="space-y-6">
      {/* Audio Settings */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">Audio Settings</h3>
        
        <div className="space-y-4">
          {/* Sensitivity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Microphone Sensitivity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => adjustValue('sensitivity', -5)}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ArrowDown className="w-4 h-4 text-purple-600" />
              </button>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${settings.sensitivity}%` }}
                />
              </div>
              <button
                onClick={() => adjustValue('sensitivity', 5)}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ArrowUp className="w-4 h-4 text-purple-600" />
              </button>
              <span className="text-sm text-gray-600 w-10">{settings.sensitivity}%</span>
            </div>
          </div>

          {/* Tuning Standard */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tuning Standard (Hz)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateSetting('tuningStandard', settings.tuningStandard - 1)}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ArrowDown className="w-4 h-4 text-purple-600" />
              </button>
              <div className="flex-1 bg-white/30 backdrop-blur-sm rounded-xl p-3 text-center">
                <span className="font-medium text-purple-700">{settings.tuningStandard} Hz</span>
              </div>
              <button
                onClick={() => updateSetting('tuningStandard', settings.tuningStandard + 1)}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ArrowUp className="w-4 h-4 text-purple-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">App Settings</h3>
        
        <div className="space-y-4">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {['light', 'dark', 'auto'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateSetting('theme', theme)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    settings.theme === theme
                      ? 'bg-gradient-to-r from-purple-400/30 to-pink-400/30 text-purple-700 border-2 border-purple-300'
                      : 'bg-white/10 text-gray-600 hover:bg-white/20'
                  }`}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Settings */}
          {[
            { key: 'notifications', label: 'Push Notifications', description: 'Get reminded to practice' },
            { key: 'vibration', label: 'Haptic Feedback', description: 'Vibrate on interactions' },
            { key: 'autoRecord', label: 'Auto-Record', description: 'Start recording automatically' },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
              <div>
                <div className="font-medium text-gray-700">{setting.label}</div>
                <div className="text-sm text-gray-600">{setting.description}</div>
              </div>
              <button
                onClick={() => updateSetting(setting.key, !settings[setting.key as keyof typeof settings])}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  settings[setting.key as keyof typeof settings]
                    ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                    : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                    settings[setting.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-purple-700 mb-4">About GIGAVIBE</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>Version 1.0.0</p>
          <p>AI-powered vocal coaching tuner designed to help you improve your singing with real-time feedback and personalized practice sessions.</p>
          <div className="pt-4">
            <button className="w-full bg-gradient-to-r from-purple-400 to-pink-400 text-white py-3 rounded-2xl font-medium hover:from-purple-500 hover:to-pink-500 transition-all">
              Rate GIGAVIBE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
