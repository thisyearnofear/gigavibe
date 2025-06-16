
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { corsHeaders } from './constants.ts';
import { VocalData } from './types.ts';
import { generateCoachingPrompt, parseFeedback } from './prompt-utils.ts';
import { callOpenAICoaching } from './openai-handler.ts';
import { callAnthropicCoaching } from './anthropic-handler.ts';
import { callGeminiCoaching } from './gemini-handler.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vocalData, model, userId, skillLevel = 'beginner', personality = 'encouraging' } = await req.json();
    const startTime = Date.now();

    // Generate coaching prompt based on vocal analysis
    const coachingPrompt = generateCoachingPrompt(vocalData as VocalData, skillLevel);

    let response;
    let tokens = { prompt: 0, completion: 0, total: 0 };

    // Get model configuration
    const { data: modelConfig } = await supabase
      .from('ai_model_configs')
      .select('*')
      .eq('model', model)
      .single();

    if (!modelConfig?.is_enabled) {
      throw new Error(`Model ${model} is not available for coaching`);
    }

    // Call appropriate AI model
    switch (model) {
      case 'openai':
        response = await callOpenAICoaching(coachingPrompt, modelConfig, personality);
        break;
      case 'anthropic':
        response = await callAnthropicCoaching(coachingPrompt, modelConfig, personality);
        break;
      case 'gemini':
        response = await callGeminiCoaching(coachingPrompt, modelConfig, personality);
        break;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    tokens = response.tokens;
    const cost = (tokens.total / 1000) * modelConfig.cost_per_1k_tokens;
    const responseTime = Date.now() - startTime;

    // Parse feedback categories
    const feedback = parseFeedback(response.text);

    // Track usage
    if (userId) {
      await supabase.from('ai_usage').insert({
        user_id: userId,
        model,
        prompt_tokens: tokens.prompt,
        completion_tokens: tokens.completion,
        total_tokens: tokens.total,
        estimated_cost: cost,
        response_time_ms: responseTime,
        status: 'success'
      });
    }

    return new Response(JSON.stringify({
      feedback: feedback.text,
      categories: feedback.categories,
      model,
      tokens,
      cost,
      responseTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Coaching Error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      feedback: "I'm having trouble analyzing your performance right now. Keep practicing!"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
