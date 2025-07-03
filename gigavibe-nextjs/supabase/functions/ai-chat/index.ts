
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, model, userId } = await req.json();
    const startTime = Date.now();

    let response;
    let tokens = { prompt: 0, completion: 0, total: 0 };
    let cost = 0;

    // Get model configuration
    const { data: modelConfig } = await supabase
      .from('ai_model_configs')
      .select('*')
      .eq('model', model)
      .single();

    if (!modelConfig?.is_enabled) {
      throw new Error(`Model ${model} is not enabled`);
    }

    switch (model) {
      case 'openai':
        response = await callOpenAI(message, modelConfig);
        break;
      case 'anthropic':
        response = await callAnthropic(message, modelConfig);
        break;
      case 'gemini':
        response = await callGemini(message, modelConfig);
        break;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    tokens = response.tokens;
    cost = (tokens.total / 1000) * modelConfig.cost_per_1k_tokens;
    const responseTime = Date.now() - startTime;

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
      response: response.text,
      model,
      tokens,
      cost,
      responseTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    const { model, userId } = await req.json().catch(() => ({}));
    if (userId && model) {
      await supabase.from('ai_usage').insert({
        user_id: userId,
        model,
        status: 'error',
        error_message: error.message
      });
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: await getFallbackResponse(message)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callOpenAI(message: string, config: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: message }],
      max_tokens: config.max_tokens,
      temperature: config.temperature,
    }),
  });

  const data = await response.json();
  return {
    text: data.choices[0].message.content,
    tokens: {
      prompt: data.usage.prompt_tokens,
      completion: data.usage.completion_tokens,
      total: data.usage.total_tokens
    }
  };
}

async function callAnthropic(message: string, config: any) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: config.max_tokens,
      messages: [{ role: 'user', content: message }],
      temperature: config.temperature,
    }),
  });

  const data = await response.json();
  return {
    text: data.content[0].text,
    tokens: {
      prompt: data.usage.input_tokens,
      completion: data.usage.output_tokens,
      total: data.usage.input_tokens + data.usage.output_tokens
    }
  };
}

async function callGemini(message: string, config: any) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${Deno.env.get('GOOGLE_AI_API_KEY')}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: message }] }],
      generationConfig: {
        maxOutputTokens: config.max_tokens,
        temperature: config.temperature,
      }
    }),
  });

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  
  // Estimate tokens (Gemini doesn't provide exact counts)
  const estimatedTokens = Math.ceil(text.length / 4);
  
  return {
    text,
    tokens: {
      prompt: Math.ceil(message.length / 4),
      completion: estimatedTokens,
      total: Math.ceil(message.length / 4) + estimatedTokens
    }
  };
}

async function getFallbackResponse(message: string) {
  return "I apologize, but I'm currently experiencing technical difficulties. Please try again later or contact support if the issue persists.";
}
