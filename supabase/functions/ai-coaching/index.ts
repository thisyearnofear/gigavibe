
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
    const { vocalData, model, userId, skillLevel = 'beginner' } = await req.json();
    const startTime = Date.now();

    // Generate coaching prompt based on vocal analysis
    const coachingPrompt = generateCoachingPrompt(vocalData, skillLevel);

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
        response = await callOpenAICoaching(coachingPrompt, modelConfig);
        break;
      case 'anthropic':
        response = await callAnthropicCoaching(coachingPrompt, modelConfig);
        break;
      case 'gemini':
        response = await callGeminiCoaching(coachingPrompt, modelConfig);
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

function generateCoachingPrompt(vocalData: any, skillLevel: string) {
  const { pitchRange, vibrato, stability, volume, formants, sessionStats } = vocalData;
  
  return `You are an expert vocal coach providing real-time feedback. Analyze this vocal performance data and provide encouraging, specific coaching advice:

PERFORMANCE DATA:
- Pitch Range: ${pitchRange.lowestNote} to ${pitchRange.highestNote}
- Pitch Stability: ${Math.round(stability.pitchConsistency)}%
- Average Deviation: ${Math.round(stability.averageDeviation)} cents
- Volume Control: Current ${Math.round(volume.current)}%, Average ${Math.round(volume.average)}%
- Vibrato: ${vibrato.detected ? `Detected (${vibrato.rate.toFixed(1)}Hz, ${vibrato.depth.toFixed(1)} cents)` : 'Not detected'}
- Vowel Sound: ${formants.vowelEstimate}
- Session Duration: ${Math.round(sessionStats.duration)}s
- Notes Hit: ${sessionStats.notesHit.join(', ')}
- Overall Score: ${Math.round(sessionStats.accuracyScore)}/100

SKILL LEVEL: ${skillLevel}

Provide feedback in this format:
[TECHNIQUE] - Technical advice about breath, posture, or vocal technique
[PITCH] - Specific pitch accuracy feedback
[RHYTHM] - Timing and flow observations
[BREATH] - Breathing and support suggestions

Keep feedback encouraging, specific, and actionable. Limit to 2-3 sentences per category. Focus on the most important improvement areas.`;
}

function parseFeedback(text: string) {
  const categories = {
    technique: '',
    pitch: '',
    rhythm: '',
    breath: ''
  };

  const techniqueMatch = text.match(/\[TECHNIQUE\](.*?)(?=\[|$)/s);
  const pitchMatch = text.match(/\[PITCH\](.*?)(?=\[|$)/s);
  const rhythmMatch = text.match(/\[RHYTHM\](.*?)(?=\[|$)/s);
  const breathMatch = text.match(/\[BREATH\](.*?)(?=\[|$)/s);

  if (techniqueMatch) categories.technique = techniqueMatch[1].trim();
  if (pitchMatch) categories.pitch = pitchMatch[1].trim();
  if (rhythmMatch) categories.rhythm = rhythmMatch[1].trim();
  if (breathMatch) categories.breath = breathMatch[1].trim();

  return {
    text,
    categories
  };
}

async function callOpenAICoaching(prompt: string, config: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an encouraging, expert vocal coach who provides specific, actionable feedback to help singers improve their technique and confidence.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: config.max_tokens,
      temperature: 0.7,
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

async function callAnthropicCoaching(prompt: string, config: any) {
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
      messages: [
        { 
          role: 'user', 
          content: `You are an encouraging, expert vocal coach. ${prompt}` 
        }
      ],
      temperature: 0.7,
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

async function callGeminiCoaching(prompt: string, config: any) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${Deno.env.get('GOOGLE_AI_API_KEY')}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ 
        parts: [{ 
          text: `You are an encouraging, expert vocal coach providing specific feedback. ${prompt}` 
        }] 
      }],
      generationConfig: {
        maxOutputTokens: config.max_tokens,
        temperature: 0.7,
      }
    }),
  });

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  
  const estimatedTokens = Math.ceil(text.length / 4);
  
  return {
    text,
    tokens: {
      prompt: Math.ceil(prompt.length / 4),
      completion: estimatedTokens,
      total: Math.ceil(prompt.length / 4) + estimatedTokens
    }
  };
}
