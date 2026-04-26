import { execSync, spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { isGatewayHealthy } from './detect.js';
import { logger } from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GATEWAY_DIR = path.resolve(__dirname, '../../gateway');

let gatewayProcess = null;
let shutdownRegistered = false;

export async function dockerComposeUp(config) {
  logger.info('Running docker compose up', { cwd: GATEWAY_DIR });
  const env = {
    ...process.env,
    ...config.keys,
  };

  gatewayProcess = spawn('docker', ['compose', 'up', '-d'], {
    cwd: GATEWAY_DIR,
    env,
    stdio: 'pipe',
  });

  await new Promise((resolve, reject) => {
    gatewayProcess.on('close', (code) => {
      if (code === 0) {
        logger.info('docker compose up exited successfully');
        resolve();
      } else {
        logger.error('docker compose up failed', { exitCode: code });
        reject(new Error(`docker compose up exited with code ${code}`));
      }
    });
    gatewayProcess.on('error', (err) => {
      logger.error('docker compose up spawn error', { error: err.message });
      reject(err);
    });
  });

  // wait for health
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (await isGatewayHealthy(config.gateway.baseUrl)) {
      logger.info('Gateway became healthy');
      registerShutdown(config);
      return;
    }
    await sleep(1000);
  }
  logger.error('Gateway health timeout after 30s');
  throw new Error('LiteLLM gateway did not become healthy within 30s');
}

export async function dockerComposeDown() {
  logger.info('Running docker compose down');
  try {
    execSync('docker compose down', { cwd: GATEWAY_DIR, stdio: 'ignore' });
    logger.info('docker compose down succeeded');
  } catch (err) {
    logger.error('docker compose down failed', { error: err.message });
    console.error(err);
  }
}

function registerShutdown(config) {
  if (shutdownRegistered) return;
  shutdownRegistered = true;
  const down = () => {
    logger.info('Shutdown hook: running docker compose down');
    try {
      execSync('docker compose down', { cwd: GATEWAY_DIR, stdio: 'ignore' });
    } catch (error) {
      logger.error('Shutdown hook: docker compose down failed', { error: error.message });
      console.error(error);
    }
  };
  process.on('exit', down);
  process.on('SIGINT', () => {
    down();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    down();
    process.exit(0);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
