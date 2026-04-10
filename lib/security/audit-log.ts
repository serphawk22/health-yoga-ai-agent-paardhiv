type SecuritySeverity = 'info' | 'warn' | 'error';

export interface SecurityEvent {
  event: string;
  severity?: SecuritySeverity;
  route?: string;
  userId?: string;
  identifier?: string;
  metadata?: Record<string, unknown>;
}

const SENSITIVE_KEY_PATTERN = /password|token|cookie|authorization|secret|apikey|api_key/i;

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return value.length > 400 ? `${value.slice(0, 400)}...` : value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map(sanitizeValue);
  }

  if (typeof value === 'object') {
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(input)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        output[key] = '[REDACTED]';
      } else {
        output[key] = sanitizeValue(nestedValue);
      }
    }

    return output;
  }

  return value;
}

export function logSecurityEvent(input: SecurityEvent) {
  const payload = {
    timestamp: new Date().toISOString(),
    category: 'security',
    event: input.event,
    route: input.route,
    userId: input.userId,
    identifier: input.identifier,
    metadata: sanitizeValue(input.metadata),
  };

  const serialized = JSON.stringify(payload);

  if (input.severity === 'error') {
    console.error(serialized);
    return;
  }

  if (input.severity === 'info') {
    console.info(serialized);
    return;
  }

  console.warn(serialized);
}
