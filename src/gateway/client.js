import { logger } from '../logger.js';

export async function* streamViaGateway(modelId, messages, config) {
  const { baseUrl, apiKey } = config.gateway;
  logger.info('Gateway stream start', { model: modelId, baseUrl });

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      stream: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error('Gateway stream error response', { model: modelId, status: res.status, body });
    throw new Error(`Gateway error ${res.status}: ${body}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let tokenCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') {
        logger.info('Gateway stream done', { model: modelId, tokens: tokenCount });
        return;
      }
      try {
        const json = JSON.parse(data);
        const token = json.choices?.[0]?.delta?.content;
        if (token) {
          tokenCount++;
          yield token;
        }
      } catch {
        logger.debug('Malformed SSE chunk skipped', { model: modelId, data });
      }
    }
  }

  logger.info('Gateway stream ended', { model: modelId, tokens: tokenCount });
}
