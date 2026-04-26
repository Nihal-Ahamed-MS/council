import { execSync } from 'child_process';
import { logger } from '../logger.js';

export function isDockerRunning() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    logger.debug('Docker daemon is running');
    return true;
  } catch {
    logger.debug('Docker daemon not reachable');
    return false;
  }
}

export async function isGatewayHealthy(baseUrl = 'http://localhost:4000') {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${baseUrl}/health`, { signal: controller.signal });
    clearTimeout(timer);
    logger.debug('Gateway health check', { baseUrl, ok: res.ok, status: res.status });
    return res.ok;
  } catch (err) {
    logger.debug('Gateway health check failed', { baseUrl, error: err.message });
    return false;
  }
}

export async function verifyModels(models, baseUrl, apiKey) {
  logger.info('Pinging models via gateway', { count: models.length, baseUrl });
  const results = await Promise.allSettled(
    models.map(async (model) => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model.id,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 1,
          }),
        });
        clearTimeout(timer);
        logger.debug('Model ping', { model: model.id, available: res.ok, status: res.status });
        return { ...model, available: res.ok };
      } catch (err) {
        logger.warn('Model ping failed', { model: model.id, error: err.message });
        return { ...model, available: false };
      }
    })
  );
  return results.map((r) =>
    r.status === 'fulfilled' ? r.value : { ...models[0], available: false }
  );
}
