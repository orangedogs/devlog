# ---- 빌드 단계 ----
FROM node:20-alpine AS builder
WORKDIR /app

# 패키지 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# ---- 실행 단계 ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 실행에 필요한 파일만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Cloud Run은 PORT 환경변수를 자동으로 제공합니다
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
