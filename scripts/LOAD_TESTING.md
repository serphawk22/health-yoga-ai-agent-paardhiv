# Load Testing

Use `scripts/load-test.js` to pressure-test key endpoints.

## Quick Start

```bash
node scripts/load-test.js --scenario turn --total 300 --concurrency 30
```

## Scenarios

- `turn`: GET `/api/turn-credentials`
- `auth-google`: GET `/api/auth/google?isLogin=true&role=PATIENT`
- `auth-spotify`: GET `/api/auth/spotify`
- `test-chat`: POST `/api/test_harness` -> `chat.sendChatMessage`
- `test-diet`: POST `/api/test_harness` -> `recommendations.getDietRecommendation`

## Parameters

- `--baseUrl`: Base URL (default: `http://localhost:3000` or `BASE_URL` env)
- `--scenario`: One of the scenarios above
- `--total`: Total requests
- `--concurrency`: Parallel workers
- `--timeoutMs`: Per-request timeout in milliseconds
- `--cookie`: Optional session cookie (`health-agent-session=...`)

## Notes

- `test-chat` and `test-diet` require authentication. If `--cookie` is omitted, the script attempts to create a temporary session via `/api/test_setup`.
- `/api/test_setup` and `/api/test_harness` are blocked in production by default unless `ALLOW_TEST_ENDPOINTS=true`.
- The script exits with non-zero status if any request fails.
