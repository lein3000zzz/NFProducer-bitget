FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY src ./src
COPY .env ./

CMD ["bun", "run", "start"]
