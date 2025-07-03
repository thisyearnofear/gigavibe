
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CoachingFeedback {
  text: string;
  categories: {
    technique: string;
    pitch: string;
    rhythm: string;
    breath: string;
  };
  model: string;
  timestamp: Date;
}

interface CoachingOptions {
  model: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  autoFeedback: boolean;
  personality: 'encouraging' | 'technical' | 'friendly';
}

export const useAICoaching = () => {
  const [feedback, setFeedback] = useState<CoachingFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<CoachingOptions>({
    model: 'openai',
    skillLevel: 'beginner',
    autoFeedback: false,
    personality: 'encouraging',
  });

  const requestFeedback = useCallback(async (vocalData: any) => {
    if (!vocalData || isLoading) return;

    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-coaching', {
        body: {
          vocalData,
          model: options.model,
          userId: user?.id,
          skillLevel: options.skillLevel,
          personality: options.personality,
        }
      });

      if (error) throw error;

      const newFeedback: CoachingFeedback = {
        text: data.feedback,
        categories: data.categories || {
          technique: '',
          pitch: '',
          rhythm: '',
          breath: ''
        },
        model: data.model,
        timestamp: new Date()
      };

      setFeedback(prev => [newFeedback, ...prev.slice(0, 9)]); // Keep last 10 feedback items
      return newFeedback;

    } catch (error) {
      console.error('Coaching feedback error:', error);
      const fallbackFeedback: CoachingFeedback = {
        text: "Keep practicing! Focus on maintaining steady pitch and consistent breathing.",
        categories: {
          technique: "Work on your posture and vocal placement",
          pitch: "Try to stay more centered on your target notes",
          rhythm: "Keep a steady pace",
          breath: "Focus on diaphragmatic breathing"
        },
        model: options.model,
        timestamp: new Date()
      };
      setFeedback(prev => [fallbackFeedback, ...prev.slice(0, 9)]);
      return fallbackFeedback;
    } finally {
      setIsLoading(false);
    }
  }, [options, isLoading]);

  const clearFeedback = useCallback(() => {
    setFeedback([]);
  }, []);

  const updateOptions = useCallback((newOptions: Partial<CoachingOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  return {
    feedback,
    isLoading,
    options,
    requestFeedback,
    clearFeedback,
    updateOptions
  };
};
