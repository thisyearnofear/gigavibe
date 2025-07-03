
import { systemPrompts } from './constants.ts';
import { AIResponse } from './types.ts';

export async function callAnthropicCoaching(prompt: string, config: any, personality: string): Promise<AIResponse> {
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
      system: systemPrompts[personality] || systemPrompts['encouraging'],
      messages: [
        { 
          role: 'user', 
          content: prompt
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
