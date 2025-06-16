
import { systemPrompts } from './constants.ts';
import { AIResponse } from './types.ts';

export async function callOpenAICoaching(prompt: string, config: any, personality: string): Promise<AIResponse> {
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
          content: systemPrompts[personality] || systemPrompts['encouraging']
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
