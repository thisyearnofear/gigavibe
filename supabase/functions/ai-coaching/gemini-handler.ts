
import { systemPrompts } from './constants.ts';
import { AIResponse } from './types.ts';

export async function callGeminiCoaching(prompt: string, config: any, personality: string): Promise<AIResponse> {
  const systemPrompt = systemPrompts[personality] || systemPrompts['encouraging'];

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${Deno.env.get('GOOGLE_AI_API_KEY')}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ 
        parts: [{ 
          text: `${systemPrompt} ${prompt}`
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
