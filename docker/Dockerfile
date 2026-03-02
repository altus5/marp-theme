FROM node:20-slim

# Chromium 依存パッケージ（marp-cli / mermaid-cli 共通）
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer にシステム Chromium を使わせる
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_CHROMIUM_REVISION=skip
ENV CHROME_FLAGS="--no-sandbox --disable-setuid-sandbox"

WORKDIR /marp-theme
COPY package.json ./
RUN npm install --omit=dev
ENV PATH="/marp-theme/node_modules/.bin:$PATH"

COPY . .

ENTRYPOINT ["node", "/marp-theme/scripts/cli.js"]
