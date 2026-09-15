FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Enable corepack / pnpm and common utilities
RUN corepack enable \
  && corepack prepare pnpm@9.15.0 --activate \
  && apt-get update \
  && apt-get install -y --no-install-recommends git curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces/funded-portfolio-manager
