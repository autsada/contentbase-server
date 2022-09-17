# Build stage
FROM node:16-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Final stage
FROM node:16-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY package*.json ./
COPY --from=builder /usr/src/app/dist ./
RUN npm ci --only=production
EXPOSE 4000
CMD ["app.js"]