# Variables
APP_NAME = express-sql-orm-comparison
DOCKER_COMPOSE = docker-compose.yml

# App names without -app suffix
APPS = drizzle objection prisma sequelize typeorm

# Help target
help:
	@echo "Available targets:"
	@echo "  install          - Install dependencies for all apps using pnpm"
	@echo "  dev              - Run all apps in development mode"
	@echo "  build            - Build all apps"
	@echo "  test             - Run tests for all apps"
	@echo "  up               - Start all services with docker-compose"
	@echo "  down             - Stop all services"
	@echo "  logs             - View logs from all services"
	@echo "  clean            - Remove node_modules and build artifacts"
	@echo "  docker-build     - Build Docker images for all apps"
	@echo "  docker-up        - Start all apps with Docker Compose"
	@echo "  docker-down      - Stop all apps with Docker Compose"
	@echo "  "
	@echo "App-specific targets:"
	@echo "  dev-[app]        - Run specific app in development mode (drizzle, objection, prisma, sequelize, typeorm)"
	@echo "  build-[app]      - Build specific app (drizzle, objection, prisma, sequelize, typeorm)"
	@echo "  test-[app]       - Run tests for specific app (drizzle, objection, prisma, sequelize, typeorm)"
	@echo "  install-[app]    - Install dependencies for specific app (drizzle, objection, prisma, sequelize, typeorm)"
	@echo "  clean-[app]      - Clean specific app (drizzle, objection, prisma, sequelize, typeorm)"

# Install dependencies for all apps using pnpm
install:
	@echo "Installing dependencies for all apps using pnpm..."
	pnpm install
	@echo "Dependencies installed successfully!"

# Run all apps in development mode
dev:
	@echo "Starting all apps in development mode..."
	pnpm turbo dev --concurrency=20

# Build all apps
build:
	@echo "Building all apps..."
	pnpm build

# Run tests for all apps
test:
	@echo "Running tests for all apps..."
	pnpm test

# Start all services with docker-compose
up:
	@echo "Starting services with docker-compose..."
	docker-compose up -d

# Stop all services
down:
	@echo "Stopping services..."
	docker-compose down

# View logs from all services
logs:
	@echo "Viewing logs..."
	docker-compose logs -f

# Build Docker images for all apps
docker-build:
	@echo "Building Docker images for all apps..."
	docker-compose build

# Start all apps with Docker Compose
docker-up:
	@echo "Starting all apps with Docker Compose..."
	docker-compose up -d

# Stop all apps with Docker Compose
docker-down:
	@echo "Stopping all apps with Docker Compose..."
	docker-compose down

# Clean node_modules and build artifacts
clean:
	@echo "Cleaning node_modules and build artifacts..."
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf apps/*/dist
	rm -rf packages/*/node_modules
	rm -rf packages/*/dist
	@echo "Clean complete!"

# App-specific targets
install-drizzle:
	@echo "Installing dependencies for drizzle..."
	pnpm --filter=@apps/drizzle install
	@echo "Dependencies installed successfully for drizzle!"

install-objection:
	@echo "Installing dependencies for objection..."
	pnpm --filter=@apps/objection install
	@echo "Dependencies installed successfully for objection!"

install-prisma:
	@echo "Installing dependencies for prisma..."
	pnpm --filter=@apps/prisma install
	@echo "Dependencies installed successfully for prisma!"

install-sequelize:
	@echo "Installing dependencies for sequelize..."
	pnpm --filter=@apps/sequelize install
	@echo "Dependencies installed successfully for sequelize!"

install-typeorm:
	@echo "Installing dependencies for typeorm..."
	pnpm --filter=@apps/typeorm install
	@echo "Dependencies installed successfully for typeorm!"

dev-drizzle:
	@echo "Starting drizzle in development mode on port 3004..."
	PORT=3004 pnpm --filter=@apps/drizzle dev
	@echo "drizzle started in development mode!"

dev-objection:
	@echo "Starting objection in development mode on port 3005..."
	PORT=3005 pnpm --filter=@apps/objection dev
	@echo "objection started in development mode!"

dev-prisma:
	@echo "Starting prisma in development mode on port 3001..."
	PORT=3001 pnpm --filter=@apps/prisma dev
	@echo "prisma started in development mode!"

dev-sequelize:
	@echo "Starting sequelize in development mode on port 3003..."
	PORT=3003 pnpm --filter=@apps/sequelize dev
	@echo "sequelize started in development mode!"

dev-typeorm:
	@echo "Starting typeorm in development mode on port 3002..."
	PORT=3002 pnpm --filter=@apps/typeorm dev
	@echo "typeorm started in development mode!"

build-drizzle:
	@echo "Building drizzle..."
	pnpm --filter=@apps/drizzle build
	@echo "drizzle built successfully!"

build-objection:
	@echo "Building objection..."
	pnpm --filter=@apps/objection build
	@echo "objection built successfully!"

build-prisma:
	@echo "Building prisma..."
	pnpm --filter=@apps/prisma build
	@echo "prisma built successfully!"

build-sequelize:
	@echo "Building sequelize..."
	pnpm --filter=@apps/sequelize build
	@echo "sequelize built successfully!"

build-typeorm:
	@echo "Building typeorm..."
	pnpm --filter=@apps/typeorm build
	@echo "typeorm built successfully!"

test-drizzle:
	@echo "Running tests for drizzle..."
	pnpm --filter=@apps/drizzle test
	@echo "Tests completed for drizzle!"

test-objection:
	@echo "Running tests for objection..."
	pnpm --filter=@apps/objection test
	@echo "Tests completed for objection!"

test-prisma:
	@echo "Running tests for prisma..."
	pnpm --filter=@apps/prisma test
	@echo "Tests completed for prisma!"

test-sequelize:
	@echo "Running tests for sequelize..."
	pnpm --filter=@apps/sequelize test
	@echo "Tests completed for sequelize!"

test-typeorm:
	@echo "Running tests for typeorm..."
	pnpm --filter=@apps/typeorm test
	@echo "Tests completed for typeorm!"

clean-drizzle:
	@echo "Cleaning drizzle build artifacts..."
	rm -rf apps/drizzle/node_modules
	rm -rf apps/drizzle/dist
	@echo "Clean complete for drizzle!"

clean-objection:
	@echo "Cleaning objection build artifacts..."
	rm -rf apps/objection/node_modules
	rm -rf apps/objection/dist
	@echo "Clean complete for objection!"

clean-prisma:
	@echo "Cleaning prisma build artifacts..."
	rm -rf apps/prisma/node_modules
	rm -rf apps/prisma/dist
	@echo "Clean complete for prisma!"

clean-sequelize:
	@echo "Cleaning sequelize build artifacts..."
	rm -rf apps/sequelize/node_modules
	rm -rf apps/sequelize/dist
	@echo "Clean complete for sequelize!"

clean-typeorm:
	@echo "Cleaning typeorm build artifacts..."
	rm -rf apps/typeorm/node_modules
	rm -rf apps/typeorm/dist
	@echo "Clean complete for typeorm!"

.PHONY: help install dev build test up down logs docker-build docker-up docker-down clean install-drizzle install-objection install-prisma install-sequelize install-typeorm dev-drizzle dev-objection dev-prisma dev-sequelize dev-typeorm build-drizzle build-objection build-prisma build-sequelize build-typeorm test-drizzle test-objection test-prisma test-sequelize test-typeorm clean-drizzle clean-objection clean-prisma clean-sequelize clean-typeorm