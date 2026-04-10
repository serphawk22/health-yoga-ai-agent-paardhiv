/*
  Lightweight load test runner for key Health Agent endpoints.

  Usage examples:
  node scripts/load-test.js --scenario turn --total 300 --concurrency 30
  node scripts/load-test.js --scenario auth-google --total 200 --concurrency 20
  node scripts/load-test.js --scenario test-chat --total 120 --concurrency 12
  node scripts/load-test.js --scenario test-diet --total 80 --concurrency 8

  Optional:
  --baseUrl http://localhost:3000
  --cookie "health-agent-session=<token>"
  --timeoutMs 15000
*/

const DEFAULT_BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DEFAULT_TOTAL = 100;
const DEFAULT_CONCURRENCY = 10;
const DEFAULT_TIMEOUT_MS = 15000;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const part = argv[i];
    if (!part.startsWith('--')) continue;
    const key = part.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
    args[key] = value;
  }
  return args;
}

function toInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

function summarizeResults(results, startedAt, endedAt) {
  const durationMs = endedAt - startedAt;
  const durationSeconds = durationMs / 1000;

  const latencies = results.map((r) => r.durationMs);
  const successCount = results.filter((r) => r.ok).length;
  const failureCount = results.length - successCount;

  const statusCounts = new Map();
  for (const item of results) {
    const key = String(item.status);
    statusCounts.set(key, (statusCounts.get(key) || 0) + 1);
  }

  return {
    total: results.length,
    successCount,
    failureCount,
    durationMs,
    rps: durationSeconds > 0 ? Number((results.length / durationSeconds).toFixed(2)) : 0,
    avgMs: latencies.length > 0 ? Number((latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2)) : 0,
    p50Ms: percentile(latencies, 50),
    p95Ms: percentile(latencies, 95),
    p99Ms: percentile(latencies, 99),
    minMs: latencies.length > 0 ? Math.min(...latencies) : 0,
    maxMs: latencies.length > 0 ? Math.max(...latencies) : 0,
    statusCounts: Object.fromEntries(statusCounts.entries()),
  };
}

async function setupTestHarnessSession(baseUrl) {
  const seed = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const payload = {
    email: `loadtest-${seed}@example.com`,
    password: `LoadTest#${seed}`,
    name: `Load Test ${seed}`,
  };

  const response = await fetch(`${baseUrl}/api/test_setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.success || !data?.token) {
    throw new Error(`Failed to setup test harness session: ${JSON.stringify(data)}`);
  }

  return `health-agent-session=${data.token}`;
}

function buildScenarioRequest(scenario, baseUrl, cookieHeader, index) {
  if (scenario === 'turn') {
    return {
      url: `${baseUrl}/api/turn-credentials`,
      init: {
        method: 'GET',
        headers: cookieHeader ? { Cookie: cookieHeader } : {},
      },
    };
  }

  if (scenario === 'auth-google') {
    return {
      url: `${baseUrl}/api/auth/google?isLogin=true&role=PATIENT`,
      init: {
        method: 'GET',
      },
    };
  }

  if (scenario === 'auth-spotify') {
    return {
      url: `${baseUrl}/api/auth/spotify`,
      init: {
        method: 'GET',
      },
    };
  }

  if (scenario === 'test-chat') {
    return {
      url: `${baseUrl}/api/test_harness`,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({
          module: 'chat',
          action: 'sendChatMessage',
          payload: {
            message: `Load test message #${index + 1}`,
            sessionId: `loadtest-${Math.floor(index / 5)}`,
          },
        }),
      },
    };
  }

  if (scenario === 'test-diet') {
    return {
      url: `${baseUrl}/api/test_harness`,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({
          module: 'recommendations',
          action: 'getDietRecommendation',
          payload: {
            specificRequest: `Lean high-protein meal plan variation ${index + 1}`,
          },
        }),
      },
    };
  }

  throw new Error(`Unsupported scenario: ${scenario}`);
}

async function executeRequest(url, init, timeoutMs) {
  const start = Date.now();

  try {
    const response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'manual',
    });

    const durationMs = Date.now() - start;
    return {
      ok: response.ok,
      status: response.status,
      durationMs,
    };
  } catch (error) {
    return {
      ok: false,
      status: 'ERR',
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runLoadTest({ baseUrl, scenario, total, concurrency, timeoutMs, cookieHeader }) {
  const results = [];
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const idx = nextIndex;
      nextIndex += 1;

      if (idx >= total) {
        break;
      }

      const { url, init } = buildScenarioRequest(scenario, baseUrl, cookieHeader, idx);
      const result = await executeRequest(url, init, timeoutMs);
      results.push(result);
    }
  }

  const startedAt = Date.now();
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const endedAt = Date.now();

  return summarizeResults(results, startedAt, endedAt);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const scenario = String(args.scenario || 'turn');
  const baseUrl = String(args.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
  const total = toInt(args.total, DEFAULT_TOTAL);
  const concurrency = toInt(args.concurrency, DEFAULT_CONCURRENCY);
  const timeoutMs = toInt(args.timeoutMs, DEFAULT_TIMEOUT_MS);

  let cookieHeader = typeof args.cookie === 'string' ? args.cookie : '';

  if ((scenario === 'test-chat' || scenario === 'test-diet') && !cookieHeader) {
    console.log('No cookie provided. Creating a temporary authenticated session via /api/test_setup...');
    cookieHeader = await setupTestHarnessSession(baseUrl);
  }

  console.log('Running load test with config:');
  console.log(
    JSON.stringify(
      {
        baseUrl,
        scenario,
        total,
        concurrency,
        timeoutMs,
        usingCookie: !!cookieHeader,
      },
      null,
      2
    )
  );

  const summary = await runLoadTest({
    baseUrl,
    scenario,
    total,
    concurrency,
    timeoutMs,
    cookieHeader,
  });

  console.log('\nLoad test summary:');
  console.log(JSON.stringify(summary, null, 2));

  if (summary.failureCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Load test failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
