const isDev = process.env.NODE_ENV !== 'production';

function formatArgs(level, args) {
  const ts = new Date().toISOString();
  return [`[${ts}] [${level}]`, ...args];
}

const logger = {
  debug: (...args) => { if (isDev) console.debug(...formatArgs('DEBUG', args)); },
  info: (...args) => { if (isDev) console.info(...formatArgs('INFO', args)); },
  error: (...args) => { console.error(...formatArgs('ERROR', args)); },
};

module.exports = logger;
