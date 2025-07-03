
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AIResponse {
  model: string;
  response: string;
  tokens: { prompt: number; completion: number; total: number };
  cost: number;
  responseTime: number;
  error?: string;
}

export const useAIChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);

  const sendMessage = async (message: string, model: string) => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          model,
          userId: user?.id
        }
      });

      if (error) throw error;

      if (data.error) {
        return {
          model,
          response: data.fallback || 'Error occurred',
          tokens: { prompt: 0, completion: 0, total: 0 },
          cost: 0,
          responseTime: 0,
          error: data.error
        };
      }

      return {
        model,
        response: data.response,
        tokens: data.tokens,
        cost: data.cost,
        responseTime: data.responseTime
      };
    } catch (error) {
      console.error('AI Chat Error:', error);
      return {
        model,
        response: 'Failed to get response',
        tokens: { prompt: 0, completion: 0, total: 0 },
        cost: 0,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const compareModels = async (message: string, models: string[]) => {
    setIsLoading(true);
    setResponses([]);

    const promises = models.map(model => sendMessage(message, model));
    const results = await Promise.allSettled(promises);
    
    const responses = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          model: models[index],
          response: 'Failed to get response',
          tokens: { prompt: 0, completion: 0, total: 0 },
          cost: 0,
          responseTime: 0,
          error: result.reason.message
        };
      }
    });

    setResponses(responses);
    setIsLoading(false);
    return responses;
  };

  return {
    sendMessage,
    compareModels,
    isLoading,
    responses,
    setResponses
  };
};
