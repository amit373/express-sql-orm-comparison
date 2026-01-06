# SQL ORM Comparison in Express.js

This is a Turbo monorepo that compares multiple SQL ORMs in Express.js using identical architecture, shared infrastructure, and production-grade best practices.

## 🏗️ Monorepo Structure

```
.
├── apps/
│   ├── prisma/          # Prisma ORM implementation (Port: 3001)
│   ├── typeorm/         # TypeORM implementation (Port: 3002)
│   ├── sequelize/       # Sequelize implementation (Port: 3003)
│   ├── drizzle/         # Drizzle ORM implementation (Port: 3004)
│   └── objection/       # Objection.js implementation (Port: 3005)
│
├── packages/
│   ├── common/          # Shared common utilities
│   ├── config/          # Shared configuration
│   ├── constants/       # Shared constants
│   ├── logger/          # Shared logging utilities
│   ├── swagger/         # Swagger documentation setup
│   ├── types/           # Shared TypeScript types
│   └── validation/      # Shared validation schemas
│
├── __tests__/           # Root-level integration tests
├── docker-compose.yml   # Docker Compose for all services
├── Makefile            # Convenience commands
├── turbo.json          # Turbo configuration
├── tsconfig.base.json  # Base TypeScript configuration
└── package.json        # Root package.json
```

## 📦 ORMs Compared

- **Prisma** (Port: 3001) - Modern ORM with type-safe database client
- **TypeORM** (Port: 3002) - Decorator-based ORM for TypeScript
- **Sequelize** (Port: 3003) - Promise-based Node.js ORM
- **Drizzle ORM** (Port: 3004) - Lightweight, type-safe SQL ORM
- **Objection.js** (Port: 3005) - SQL query builder built on Knex.js

## 🧠 Architecture Rules

- REST APIs only
- Express.js only
- Service Pattern (Controller → Service → ORM Repository)
- Controllers contain no business logic
- Services contain no HTTP logic
- ORM layer contains no business logic
- Everything reusable must go into packages/

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm (package manager)
- Docker and Docker Compose (for database)

### Installation

1. Install dependencies:

```bash
pnpm install
```

Or using Make:

```bash
make install
```

### Development

2. Run all apps in development mode:

```bash
pnpm dev
```

Or using Make:

```bash
make dev
```

3. Run individual apps:

```bash
# Using pnpm
pnpm --filter=@apps/prisma dev      # Port 3001
pnpm --filter=@apps/typeorm dev     # Port 3002
pnpm --filter=@apps/sequelize dev    # Port 3003
pnpm --filter=@apps/drizzle dev      # Port 3004
pnpm --filter=@apps/objection dev    # Port 3005

# Using Make
make dev-prisma      # Port 3001
make dev-typeorm     # Port 3002
make dev-sequelize   # Port 3003
make dev-drizzle     # Port 3004
make dev-objection   # Port 3005
```

### Building

Build all apps:

```bash
pnpm build
# or
make build
```

Build individual app:

```bash
make build-prisma
make build-typeorm
make build-sequelize
make build-drizzle
make build-objection
```

## 🧪 Testing

Run all tests:

```bash
pnpm test
# or
make test
```

Run tests for specific app:

```bash
make test-prisma
make test-typeorm
make test-sequelize
make test-drizzle
make test-objection
```

Unit tests:

```bash
pnpm test:unit
```

Integration tests:

```bash
pnpm test:integration
```

## 🐳 Docker

### Using Docker Compose

Start all services (apps + PostgreSQL):

```bash
docker-compose up -d
# or
make docker-up
```

Stop all services:

```bash
docker-compose down
# or
make docker-down
```

View logs:

```bash
docker-compose logs -f
# or
make logs
```

### Database Setup

Each app connects to PostgreSQL. The Docker Compose file includes:
- PostgreSQL database (Port: 5434)
- All 5 ORM apps running in containers
- Shared PostgreSQL instance with separate databases per ORM

## 📚 API Documentation

Each app exposes Swagger API documentation at `/docs` endpoint:

- Prisma: http://localhost:3001/docs
- TypeORM: http://localhost:3002/docs
- Sequelize: http://localhost:3003/docs
- Drizzle: http://localhost:3004/docs
- Objection: http://localhost:3005/docs

## 🛠️ Features

- **TypeScript everywhere** - Full type safety across the monorepo
- **Shared infrastructure packages** - Reusable code in `packages/`
- **Production-grade error handling** - Consistent error responses
- **Comprehensive logging** - Request and error logging
- **Input validation** - Zod schemas for request validation
- **Swagger API documentation** - Auto-generated API docs
- **Jest unit tests** - Unit testing for all apps
- **Supertest integration tests** - API integration testing
- **Database migrations** - ORM-specific migration systems
- **Database seeders** - Seed data for testing
- **Turbo monorepo** - Fast, efficient builds and task execution
- **pnpm workspace** - Efficient package management

## 📋 Available Make Commands

```bash
make help              # Show all available commands
make install           # Install all dependencies
make dev               # Run all apps in development
make build             # Build all apps
make test              # Run all tests
make clean             # Clean node_modules and dist folders
make docker-up         # Start all Docker services
make docker-down       # Stop all Docker services
make docker-build      # Build all Docker images
```

For app-specific commands, use: `make [command]-[app]` (e.g., `make dev-prisma`, `make test-drizzle`)
