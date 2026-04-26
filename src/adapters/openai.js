import OpenAI from 'openai';
import { logger } from '../logger.js';

export async function* streamViaOpenAI(modelId, messages, keys) {
  const client = new OpenAI({ apiKey: keys.OPENAI_API_KEY });

  // strip provider prefix: "openai/gpt-4o" → "gpt-4o"
  const model = modelId.replace(/^openai\//, '');
  logger.info('OpenAI stream start', { model });

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
    logger.info('OpenAI stream done', { model, tokens: tokenCount });
  } catch (err) {
    logger.error('OpenAI stream error', { model, error: err.message });
    throw err;
  }
}
