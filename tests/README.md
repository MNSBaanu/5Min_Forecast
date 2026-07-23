# End-to-End Tests

Playwright suite for 5Min Forecast.

## Run locally

```bash
bunx playwright install chromium   # first time only
bun run test:e2e                   # headless
bun run test:e2e:ui                # interactive UI
bun run test:e2e:headed            # watch the browser
```

Playwright auto-starts `bun run dev` on port 8080. Set `BASE_URL` to target an
already-running server and `PLAYWRIGHT_SKIP_WEBSERVER=1` to skip auto-start.

## Credentials

| Role          | Email             | Password  |
| ------------- | ----------------- | --------- |
| Sales Rep     | testsr@gmail.com  | Test@1234 |
| Sales Manager | testsm@gmail.com  | Test@1234 |

Override with `E2E_REP_EMAIL`, `E2E_REP_PASSWORD`, `E2E_MANAGER_EMAIL`,
`E2E_MANAGER_PASSWORD` (used in CI via GitHub secrets).

## CI

`.github/workflows/e2e.yml` runs the suite on every push/PR against `main` and
uploads the HTML report on failure.