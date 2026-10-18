type LogFields = Record<string, string | number | boolean | null | undefined>;

const REDACT_KEYS = new Set([
  "password",
  "smtp_pass",
  "smtpPass",
  "authorization",
  "cookie",
  "email",
  "phone",
  "messengerUsername",
]);

function safeFields(fields?: LogFields) {
  if (!fields) return {};
  const out: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = REDACT_KEYS.has(key) ? "[redacted]" : value;
  }
  return out;
}

function write(level: string, message: string, fields?: LogFields) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...safeFields(fields),
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) => write("error", message, fields),
};
