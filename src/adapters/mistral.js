import OpenAI from 'openai';
import { logger } from '../logger.js';

export async function* streamViaMistral(modelId, messages, keys) {
  const client = new OpenAI({
    apiKey: keys.MISTRAL_API_KEY,
    baseURL: 'https://api.mistral.ai/v1',
  });

  // strip provider prefix: "mistral/mistral-large-latest" → "mistral-large-latest"
  const model = modelId.replace(/^mistral\//, '');
  logger.info('Mistral stream start', { model });

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
    logger.info('Mistral stream done', { model, tokens: tokenCount });
  } catch (err) {
    logger.error('Mistral stream error', { model, error: err.message });
    throw err;
  }
}
