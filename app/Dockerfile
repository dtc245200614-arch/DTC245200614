FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY --chown=node:node server.js ./
COPY --chown=node:node public ./public
# Hardening: run as the unprivileged "node" user
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "server.js"]
