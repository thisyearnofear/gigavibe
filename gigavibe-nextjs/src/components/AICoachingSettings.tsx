import { useState } from "react";
import { Settings } from "lucide-react";

interface AICoachingSettingsProps {
  options: {
    skillLevel: string;
    personality: string;
    model: string;
    autoFeedback: boolean;
  };
  updateOptions: (
    options: Partial<{
      skillLevel: string;
      personality: string;
      model: string;
      autoFeedback: boolean;
    }>
  ) => void;
}

const AICoachingSettings = ({
  options,
  updateOptions,
}: AICoachingSettingsProps) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
      >
        <Settings className="w-4 h-4 text-slate-606" />
      </button>

      {showSettings && (
        <div className="bg-slate-50 rounded-lg p-3 space-y-3 absolute right-0 top-10 w-64 shadow-lg border border-slate-200 z-10">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Skill Level
            </label>
            <select
              value={options.skillLevel}
              onChange={(e) =>
                updateOptions({ skillLevel: e.target.value as any })
              }
              className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Coaching Style
            </label>
            <select
              value={options.personality}
              onChange={(e) =>
                updateOptions({ personality: e.target.value as any })
              }
              className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1"
            >
              <option value="encouraging">Encouraging</option>
              <option value="technical">Technical</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              AI Model
            </label>
            <select
              value={options.model}
              onChange={(e) => updateOptions({ model: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1"
            >
              <option value="openai">GPT-4 (Creative)</option>
              <option value="anthropic">Claude (Analytical)</option>
              <option value="gemini">Gemini (Fast)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoFeedback"
              checked={options.autoFeedback}
              onChange={(e) =>
                updateOptions({ autoFeedback: e.target.checked })
              }
              className="rounded"
            />
            <label htmlFor="autoFeedback" className="text-xs text-slate-600">
              Auto-feedback during practice
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoachingSettings;
