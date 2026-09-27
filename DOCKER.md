# Docker — wilist-tests

Runs the app (`wilist`) and this test suite together in containers, via `docker-compose.yml`.

Requires `wilist` checked out as a sibling of this repo (`~/projects/wilist` and `~/projects/wilist-tests` side by side).

## Running

```
cd ~/projects/wilist-tests
docker compose up --build --abort-on-container-exit
```

This builds both the app (from `../wilist`) and the Playwright suite, waits for the app's `/health` check, then runs the chromium suite against it. `--abort-on-container-exit` shuts the app container down as soon as the test container finishes, so nothing keeps running in the background.

## App Dockerfile (`wilist/Dockerfile`, in the app repo)

Multi-stage build:
- **Stage 1 (builder)** — `golang:1.22-alpine`, compiles the binary only (`CGO_ENABLED=0 go build`); not part of the final image.
- **Stage 2 (runtime)** — `alpine:3.20` (not `scratch`: needs `curl` for the healthcheck and a shell for `docker exec` debugging).
- `HEALTHCHECK` hits the existing `GET /health`.
- `ENV PORT=8080`, matching the app's default.

## Test Dockerfile (`e2e/Dockerfile`)

- Base image: `mcr.microsoft.com/playwright:v1.63.0-jammy` (browsers and their system deps are already in the image — no `playwright install --with-deps` needed).
- Keep the tag version in sync with `@playwright/test` in `package.json`.
- `ENV BASE_URL` is overridden by `docker-compose.yml`.
- Default `CMD` runs chromium, same as local `npm test`.

## docker-compose.yml

Both services build from source — `wilist` via `context: ../wilist`, `wilist-tests` via `context: ./e2e`:

```yaml
services:
  wilist:
    build:
      context: ../wilist
    ports:
      - "8081:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 5s
      timeout: 3s
      retries: 3

  wilist-tests:
    build:
      context: ./e2e
    environment:
      BASE_URL: http://wilist:8080
    depends_on:
      wilist:
        condition: service_healthy
```

## Troubleshooting

- **Rosetta failed to install** (Docker Desktop, Apple Silicon, `VZErrorDomain Code=1`) — run `softwareupdate --install-rosetta --agree-to-license` manually, or disable "Use Rosetta..." under Docker Desktop → Settings → General (not needed here — the image is arm64 native).
- **`docker: command not found`** right after installing Docker Desktop — open a new terminal window; an already-open one won't pick up the updated `PATH`.
- **`port is already allocated`** — a leftover container from a previous run is still holding the port. Check `docker ps -a` and remove stale containers (`docker rm`) before the next run.

## Known limitations

- App runtime image uses `alpine`, not `scratch` — `scratch` would need a Go binary for the healthcheck instead of `curl` (or a healthcheck done entirely outside the container).
- No multi-container setup for running webkit/firefox in parallel — not tried yet, separate from the CI browser-matrix question.
- No `.dockerignore` in the app repo yet — build context is currently ~183MB (pulls in `.git`, `e2e`, the built binary); not critical, but worth trimming.
