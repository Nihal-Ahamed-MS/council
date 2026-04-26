import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../logger.js';

export async function* streamViaAnthropic(modelId, messages, keys) {
  const client = new Anthropic({ apiKey: keys.ANTHROPIC_API_KEY });

  // strip provider prefix: "anthropic/claude-3-5-sonnet-latest" → "claude-3-5-sonnet-latest"
  const model = modelId.replace(/^anthropic\//, '');
  logger.info('Anthropic stream start', { model });

  // Anthropic separates system messages
  const system = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n');
  const userMessages = messages.filter((m) => m.role !== 'system');

  try {
    const stream = client.messages.stream({
      model,
      max_tokens: 4096,
      ...(system ? { system } : {}),
      messages: userMessages,
    });

    let tokenCount = 0;
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        tokenCount++;
        yield event.delta.text;
      }
    }
    logger.info('Anthropic stream done', { model, tokens: tokenCount });
  } catch (err) {
    logger.error('Anthropic stream error', { model, error: err.message });
    throw err;
  }
}
