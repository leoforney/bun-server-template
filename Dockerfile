# Build react frontend
FROM oven/bun:1 AS bun_template_frontend_builder
WORKDIR /app/frontend

COPY frontend/ ./

RUN bun install
RUN bun run build

# Stage 2: Setup and run the production server
FROM oven/bun:1-debian AS bun_template_server
WORKDIR /app/backend
ENV NODE_ENV=production

# Copy server-specific package files and install dependencies (puppeteer)
COPY backend/ ./
RUN bun install --frozen-lockfile

# Copy the built frontend assets from the builder stage
COPY --from=bun_template_frontend_builder /app/frontend/dist ./dist

# Expose the port the server runs on
EXPOSE 8084

# Command to run the server
CMD ["bun", "run", "start"]