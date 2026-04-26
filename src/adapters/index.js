import { streamViaGateway } from '../gateway/client.js';
import { streamViaOpenAI } from './openai.js';
import { streamViaAnthropic } from './anthropic.js';
import { streamViaGemini } from './gemini.js';
import { streamViaGroq } from './groq.js';
import { streamViaMistral } from './mistral.js';
import { streamViaXAI } from './xai.js';
import { logger } from '../logger.js';

let _gatewayAvailable = false;
let _config = null;

export function initAdapters(config, gatewayAvailable) {
  _config = config;
  _gatewayAvailable = gatewayAvailable;
  logger.info('Adapters initialised', { mode: gatewayAvailable ? 'gateway' : 'sdk' });
}

export async function* streamModel(modelId, messages) {
  if (_gatewayAvailable) {
    logger.debug('Routing to gateway adapter', { model: modelId });
    yield* streamViaGateway(modelId, messages, _config);
    return;
  }

  const provider = modelId.split('/')[0];
  logger.debug('Routing to SDK adapter', { model: modelId, provider });

  switch (provider) {
    case 'openai':
      yield* streamViaOpenAI(modelId, messages, _config.keys);
      break;
    case 'anthropic':
      yield* streamViaAnthropic(modelId, messages, _config.keys);
      break;
    case 'gemini':
      yield* streamViaGemini(modelId, messages, _config.keys);
      break;
    case 'groq':
      yield* streamViaGroq(modelId, messages, _config.keys);
      break;
    case 'mistral':
      yield* streamViaMistral(modelId, messages, _config.keys);
      break;
    case 'xai':
      yield* streamViaXAI(modelId, messages, _config.keys);
      break;
    default:
      logger.error('No SDK adapter for provider', { provider, modelId });
      throw new Error(`No SDK adapter for provider "${provider}" — requires Docker/gateway mode`);
  }
}
