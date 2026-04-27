function timestamp() {
  return new Date().toISOString();
}

function formatMeta(meta) {
  if (!meta || typeof meta !== 'object') return '';
  const entries = Object.entries(meta)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`);
  return entries.length ? ` | ${entries.join(' ')}` : '';
}

function log(level, message, meta) {
  const line = `[${timestamp()}] [${level}] ${message}${formatMeta(meta)}`;
  if (level === 'ERROR') {
    console.error(line);
    return;
  }
  if (level === 'WARN') {
    console.warn(line);
    return;
  }
  console.log(line);
}

module.exports = {
  info: (message, meta) => log('INFO', message, meta),
  warn: (message, meta) => log('WARN', message, meta),
  error: (message, meta) => log('ERROR', message, meta),
  debug: (message, meta) => {
    if (String(process.env.LOG_DEBUG || 'false').toLowerCase() === 'true') {
      log('DEBUG', message, meta);
    }
  },
};
