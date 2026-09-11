# Keep Node compatible with Vite 8, independently of the Wine image's Node.
FROM node:24.21.0-bookworm-slim AS node
FROM electronuserland/builder:wine@sha256:41ae540902461b6cbc988987db79547fcc10cda04d2a6c6367504f59d4b37c64
# COPY merges directories; remove the bundled npm to avoid mixing versions.
RUN rm -rf /usr/local/lib/node_modules/npm
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
WORKDIR /project
ENV ELECTRON_CACHE=/root/.cache/electron \
    ELECTRON_BUILDER_CACHE=/root/.cache/electron-builder \
    CSC_IDENTITY_AUTO_DISCOVERY=false
COPY package.json package-lock.json ./
RUN node --version && npm --version \
    && (npm ci --foreground-scripts || { \
      status=$?; \
      cat /root/.npm/_logs/*-debug-0.log; \
      exit "$status"; \
    })
COPY . .
RUN npm run build:renderer
ENTRYPOINT ["bash", "/project/docker/package.sh"]
CMD ["all"]
