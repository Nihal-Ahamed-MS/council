import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.council');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG = {
  gateway: {
    baseUrl: 'http://localhost:4000',
    apiKey: 'sk-council-local',
  },
  models: [
    { id: 'openai/gpt-4o', label: 'GPT-4o', enabled: true },
    { id: 'anthropic/claude-3-5-sonnet-latest', label: 'Claude 3.5', enabled: true },
    { id: 'gemini/gemini-2.5-flash', label: 'Gemini 1.5', enabled: true },
    { id: 'ollama/llama3', label: 'Llama 3', enabled: true },
  ],
  keys: {},
};

export function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return null;
  }
}

export function saveConfig(config) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

export function getOrCreateConfig() {
  const existing = loadConfig();
  if (existing) return existing;
  saveConfig(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

export function getConfigPath() {
  return CONFIG_PATH;
}

export function getConfigDir() {
  return CONFIG_DIR;
}
