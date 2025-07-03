
import { useState, useEffect } from 'react';
import { X, Clock, DollarSign, Zap } from 'lucide-react';

interface AIResponse {
  model: string;
  response: string;
  tokens: { prompt: number; completion: number; total: number };
  cost: number;
  responseTime: number;
  error?: string;
}

interface AIComparisonSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  responses: AIResponse[];
  isLoading: boolean;
}

const modelNames = {
  openai: 'GPT-4',
  anthropic: 'Claude',
  gemini: 'Gemini'
};

const modelColors = {
  openai: 'border-green-200 bg-green-50',
  anthropic: 'border-purple-200 bg-purple-50',
  gemini: 'border-blue-200 bg-blue-50'
};

const AIComparisonSidebar = ({ isOpen, onClose, responses, isLoading }: AIComparisonSidebarProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <h3 className="font-semibold">AI Model Comparison</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Comparing responses...</p>
          </div>
        )}

        {responses.map((response, index) => (
          <div
            key={`${response.model}-${index}`}
            className={`border-2 rounded-xl p-4 ${modelColors[response.model as keyof typeof modelColors]}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800">
                {modelNames[response.model as keyof typeof modelNames]}
              </h4>
              {response.error && (
                <span className="text-red-500 text-xs">Error</span>
              )}
            </div>

            {response.error ? (
              <p className="text-red-600 text-sm">{response.error}</p>
            ) : (
              <>
                <div className="text-sm text-gray-700 mb-3 max-h-32 overflow-y-auto">
                  {response.response}
                </div>

                <div className="flex gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{response.responseTime}ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>{response.tokens.total} tokens</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>${response.cost.toFixed(4)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIComparisonSidebar;
