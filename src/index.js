import React from 'react';
import { render } from 'ink';
import chalk from 'chalk';
import ora from 'ora';
import { getOrCreateConfig } from './config.js';
import { isDockerRunning, isGatewayHealthy, verifyModels } from './gateway/detect.js';
import { dockerComposeUp } from './gateway/lifecycle.js';
import { initAdapters } from './adapters/index.js';
import { App } from './ui/App.jsx';
import { logger } from './logger.js';

export async function boot() {
  logger.info('council starting', { pid: process.pid, node: process.version });

  const config = getOrCreateConfig();

  if (!config) {
    logger.error('No config found — aborting boot');
    console.log(chalk.red('No config found. Run `council setup` first.'));
    process.exit(1);
  }

  logger.info('Config loaded', { models: config.models.map((m) => m.id) });

  let gatewayAvailable = false;
  let mode = 'sdk';

  const dockerSpinner = ora('Checking Docker…').start();
  if (isDockerRunning()) {
    logger.info('Docker daemon detected');
    dockerSpinner.text = 'Docker detected — starting LiteLLM gateway...';
    try {
      const alreadyHealthy = await isGatewayHealthy(config.gateway.baseUrl);
      if (!alreadyHealthy) {
        logger.info('Gateway not yet healthy — running docker compose up');
        await dockerComposeUp(config);
      } else {
        logger.info('Gateway already healthy — skipping compose up');
      }
      gatewayAvailable = true;
      mode = 'gateway';
      logger.info('Gateway ready', { baseUrl: config.gateway.baseUrl });
      dockerSpinner.succeed('Gateway ready at ' + config.gateway.baseUrl);
    } catch (err) {
      logger.warn('Gateway failed to start — falling back to direct SDKs', { error: err.message });
      dockerSpinner.warn('Gateway failed to start — falling back to direct SDKs: ' + err.message);
    }
  } else {
    logger.warn('Docker not running — SDK-only mode; Ollama unavailable');
    dockerSpinner.warn('Docker not running — using direct SDKs (Ollama unavailable)');
  }

  logger.info('Verifying models', { mode });
  const verifySpinner = ora('Verifying models…').start();
  let models;
  if (gatewayAvailable) {
    models = await verifyModels(
      config.models.filter((m) => m.enabled),
      config.gateway.baseUrl,
      config.gateway.apiKey
    );
  } else {
    models = config.models
      .filter((m) => m.enabled)
      .map((m) => {
        const provider = m.id.split('/')[0];
        if (provider === 'ollama') return { ...m, available: false };
        const keyMap = {
          openai: 'OPENAI_API_KEY',
          anthropic: 'ANTHROPIC_API_KEY',
          gemini: 'GEMINI_API_KEY',
          groq: 'GROQ_API_KEY',
          mistral: 'MISTRAL_API_KEY',
          xai: 'XAI_API_KEY',
        };
        const keyName = keyMap[provider];
        return { ...m, available: keyName ? Boolean(config.keys[keyName]) : false };
      });
  }

  const activeCount = models.filter((m) => m.available).length;
  logger.info('Model verification complete', {
    active: activeCount,
    total: models.length,
    models: models.map((m) => ({ id: m.id, available: m.available })),
  });

  if (activeCount === 0) {
    logger.error('No models available — aborting');
    verifySpinner.fail('No models are available. Run `council setup` to configure providers.');
    process.exit(1);
  }
  verifySpinner.succeed(`${activeCount}/${models.length} models available`);

  initAdapters(config, gatewayAvailable);
  logger.info('Rendering TUI');
  render(React.createElement(App, { models, mode }));
}
