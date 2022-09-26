# Build stage
FROM node:latest AS build
RUN apt-get update && apt-get install -y dumb-init
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Final stage
FROM node:16.17-bullseye-slim

ENV NODE_ENV=production
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/package*.json ./
COPY --chown=node:node --from=build /usr/src/app/dist ./
RUN chown -R node /usr/src/app/
RUN npm ci --omit=dev
EXPOSE 4000
CMD ["dumb-init", "node", "app.js"]