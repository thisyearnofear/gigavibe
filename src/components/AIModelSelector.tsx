
import { useState } from 'react';
import { Bot, Sparkles, Zap } from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const models: AIModel[] = [
  {
    id: 'openai',
    name: 'GPT-4',
    icon: <Bot className="w-5 h-5" />,
    description: 'Creative and versatile',
    color: 'from-green-400 to-emerald-500'
  },
  {
    id: 'anthropic',
    name: 'Claude',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Thoughtful and analytical',
    color: 'from-purple-400 to-violet-500'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: <Zap className="w-5 h-5" />,
    description: 'Fast and efficient',
    color: 'from-blue-400 to-cyan-500'
  }
];

interface AIModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  className?: string;
}

const AIModelSelector = ({ selectedModel, onModelChange, className = '' }: AIModelSelectorProps) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => onModelChange(model.id)}
          className={`
            flex-1 p-3 rounded-xl border-2 transition-all duration-300
            ${selectedModel === model.id
              ? `bg-gradient-to-r ${model.color} text-white border-transparent shadow-lg scale-105`
              : 'bg-white/50 border-gray-200 hover:border-gray-300 hover:bg-white/70'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            {model.icon}
            <span className="font-medium text-sm">{model.name}</span>
          </div>
          <p className="text-xs opacity-80">{model.description}</p>
        </button>
      ))}
    </div>
  );
};

export default AIModelSelector;
