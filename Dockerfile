# Stage 1: Build frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: PocketBase runtime
FROM alpine:3.21

ARG PB_VERSION=0.36.1

RUN apk add --no-cache ca-certificates wget unzip

WORKDIR /pb

# Download PocketBase
RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
    && unzip "pocketbase_${PB_VERSION}_linux_amd64.zip" \
    && rm "pocketbase_${PB_VERSION}_linux_amd64.zip"

# Copy built frontend to PocketBase public directory
COPY --from=builder /app/dist ./pb_public

# Copy migrations
COPY pocketbase/pb_migrations ./pb_migrations

EXPOSE 8080

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080"]
