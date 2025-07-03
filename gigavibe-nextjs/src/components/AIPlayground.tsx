
import { useState } from 'react';
import { Send, BarChart3, X } from 'lucide-react';
import AIModelSelector from './AIModelSelector';
import AIComparisonSidebar from './AIComparisonSidebar';
import { useAIChat } from '@/hooks/useAIChat';

const AIPlayground = () => {
  const [selectedModel, setSelectedModel] = useState('openai');
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    model?: string;
    metadata?: any;
  }>>([]);
  const [showComparison, setShowComparison] = useState(false);

  const { sendMessage, compareModels, isLoading, responses, setResponses } = useAIChat();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: 'user' as const, content: message };
    setConversation(prev => [...prev, userMessage]);
    
    const response = await sendMessage(message, selectedModel);
    
    setConversation(prev => [...prev, {
      role: 'assistant',
      content: response.response,
      model: response.model,
      metadata: {
        tokens: response.tokens,
        cost: response.cost,
        responseTime: response.responseTime,
        error: response.error
      }
    }]);

    setMessage('');
  };

  const handleCompareModels = async () => {
    if (!message.trim()) return;

    const userMessage = { role: 'user' as const, content: message };
    setConversation(prev => [...prev, userMessage]);
    
    await compareModels(message, ['openai', 'anthropic', 'gemini']);
    setShowComparison(true);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">AI Playground</h2>
        <AIModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/50 rounded-2xl p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Welcome to AI Playground</h3>
              <p className="text-gray-600 text-sm">
                Choose an AI model and start chatting, or use the compare feature to see responses from all models simultaneously.
              </p>
            </div>
          </div>
        )}

        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-white/70 text-gray-800 border border-slate-200/50'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.metadata && (
                <div className="mt-2 text-xs opacity-70 flex gap-3">
                  <span>{msg.model?.toUpperCase()}</span>
                  <span>{msg.metadata.responseTime}ms</span>
                  <span>{msg.metadata.tokens.total} tokens</span>
                  <span>${msg.metadata.cost.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white/70 backdrop-blur-sm border-t border-slate-200/50 p-4">
        <div className="flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none bg-white/50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
            <button
              onClick={handleCompareModels}
              disabled={isLoading || !message.trim()}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Compare
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Sidebar */}
      <AIComparisonSidebar
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        responses={responses}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AIPlayground;
