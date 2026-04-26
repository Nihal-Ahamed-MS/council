import OpenAI from 'openai';
import { logger } from '../logger.js';

export async function* streamViaXAI(modelId, messages, keys) {
  const client = new OpenAI({
    apiKey: keys.XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
  });

  // strip provider prefix: "xai/grok-3" → "grok-3"
  const model = modelId.replace(/^xai\//, '');
  logger.info('xAI stream start', { model });

  try {
    const stream = await client.chat.completions.create({
      model,
      messages,
      stream: true,
    });

    let tokenCount = 0;
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) {
        tokenCount++;
        yield token;
      }
    }
    logger.info('xAI stream done', { model, tokens: tokenCount });
  } catch (err) {
    logger.error('xAI stream error', { model, error: err.message });
    throw err;
  }
}
