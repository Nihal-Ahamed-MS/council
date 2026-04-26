import fs from 'fs';
import path from 'path';

const LOG_PATH = path.join(process.cwd(), 'council.log');

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
let minLevel = LEVELS.debug;

function write(level, message, meta) {
  const ts = new Date().toISOString();
  const metaPart = meta ? ' ' + JSON.stringify(meta) : '';
  const line = `${ts} [${level.toUpperCase().padEnd(5)}] ${message}${metaPart}\n`;
  try {
    fs.appendFileSync(LOG_PATH, line, 'utf8');
  } catch {
    // never crash the app over a log write
  }
}

export const logger = {
  debug: (msg, meta) => LEVELS.debug >= minLevel && write('debug', msg, meta),
  info: (msg, meta) => LEVELS.info >= minLevel && write('info', msg, meta),
  warn: (msg, meta) => LEVELS.warn >= minLevel && write('warn', msg, meta),
  error: (msg, meta) => LEVELS.error >= minLevel && write('error', msg, meta),
  setLevel: (level) => {
    if (level in LEVELS) minLevel = LEVELS[level];
  },
  getPath: () => LOG_PATH,
};
