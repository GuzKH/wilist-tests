# Official Playwright image: browsers + their OS dependencies are preinstalled,
# so we don't need `npx playwright install --with-deps` here.
# Keep this tag in sync with the @playwright/test version in package.json.
FROM mcr.microsoft.com/playwright:v1.63.0-jammy

WORKDIR /app

# Install dependencies first (separate layer, cached while only test code changes).
COPY package.json package-lock.json ./
RUN npm ci

# Now copy the actual test sources.
COPY . .

# Overridable at `docker run`/compose time; falls back to the same value
# the config already used for local (non-Docker) runs.
ENV BASE_URL=http://localhost:8081

# Default: same as `npm test` locally (chromium only).
# Override the command in docker-compose.yml to run all browsers, etc.
CMD ["npx", "playwright", "test", "--project=chromium"]
