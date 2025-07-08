import React, { useState } from "react";
import { Bot, Sparkles, Zap, MessageCircle, Volume2, X } from "lucide-react";
import { useAICoaching } from "@/hooks/useAICoaching";
import AICoachingSettings from "./AICoachingSettings";

interface AICoachingFeedbackProps {
  vocalMetrics: any;
  isListening: boolean;
  selectedModel?: string;
}

const modelIcons: Record<string, React.ReactElement> = {
  openai: <Bot className="w-4 h-4" />,
  anthropic: <Sparkles className="w-4 h-4" />,
  gemini: <Zap className="w-4 h-4" />,
};

const modelColors: Record<string, string> = {
  openai: "from-green-400 to-emerald-500",
  anthropic: "from-purple-400 to-violet-500",
  gemini: "from-blue-400 to-cyan-500",
};

const categoryIcons = {
  technique: "🎯",
  pitch: "🎵",
  rhythm: "⏱️",
  breath: "💨",
};

const AICoachingFeedback = ({
  vocalMetrics,
  isListening,
  selectedModel = "openai",
}: AICoachingFeedbackProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    feedback,
    isLoading,
    options,
    requestFeedback,
    clearFeedback,
    updateOptions,
  } = useAICoaching();

  const handleRequestFeedback = () => {
    requestFeedback(vocalMetrics);
  };

  const speakFeedback = async (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Auto-feedback when listening and option is enabled
  const shouldShowAutoFeedback =
    options.autoFeedback &&
    isListening &&
    vocalMetrics?.sessionStats?.duration > 5;

  return (
    <div className="space-y-3">
      {/* Control Panel */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg bg-gradient-to-r ${modelColors[selectedModel]} text-white`}
            >
              {modelIcons[selectedModel]}
            </div>
            <span className="text-sm font-medium text-slate-700">AI Coach</span>
          </div>

          <div className="flex items-center gap-2">
            <AICoachingSettings
              options={options}
              updateOptions={updateOptions}
            />

            <button
              onClick={handleRequestFeedback}
              disabled={isLoading || !isListening}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                isLoading || !isListening
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              {isLoading ? "Analyzing..." : "Get Feedback"}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Display */}
      {feedback.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700"
            >
              <MessageCircle className="w-4 h-4" />
              Recent Feedback ({feedback.length})
            </button>

            <button
              onClick={clearFeedback}
              className="p-1 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            className={`space-y-2 ${
              isExpanded
                ? "max-h-96 overflow-y-auto"
                : "max-h-32 overflow-hidden"
            }`}
          >
            {feedback.map((item, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1 rounded bg-gradient-to-r ${
                        modelColors[item.model]
                      } text-white`}
                    >
                      {modelIcons[item.model]}
                    </div>
                    <span className="text-xs text-slate-500">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  <button
                    onClick={() => speakFeedback(item.text)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Category-based feedback */}
                <div className="space-y-2">
                  {Object.entries(item.categories).map(
                    ([category, text]) =>
                      text && (
                        <div key={category} className="flex gap-2">
                          <span className="text-lg">
                            {
                              categoryIcons[
                                category as keyof typeof categoryIcons
                              ]
                            }
                          </span>
                          <div>
                            <div className="text-xs font-medium text-slate-600 capitalize">
                              {category}
                            </div>
                            <div className="text-sm text-slate-700">{text}</div>
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-feedback indicator */}
      {shouldShowAutoFeedback && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 border border-green-200">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Auto-feedback active - Keep practicing!
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoachingFeedback;
