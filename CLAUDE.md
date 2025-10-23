# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS application using Prisma ORM for database interactions. It follows a Clean Architecture pattern with a focus on Use Case driven design. Key features include:

## Development Commands

```bash
# Install dependencies
pnpm install

# Development (watch mode)
pnpm run start:dev

# Production build
pnpm run build
pnpm run start:prod

# Linting and formatting
pnpm run lint
pnpm run format

# Testing
pnpm run test              # Unit tests
pnpm run test:watch        # Watch mode
pnpm run test:cov          # Coverage
pnpm run test:e2e          # E2E tests
```

## Database Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Architecture

### Project Structure Philosophy

The codebase follows a **Clean Architecture** pattern with **Use Case** driven design:

```
src/
├── core/              # Business logic modules (User, Feedback, etc.)
│   └── {module}/
│       ├── dto/       # Data Transfer Objects with Zod validation
│       ├── use-cases/ # Isolated business logic operations
│       ├── {module}.controller.ts
│       ├── {module}.service.ts
│       └── {module}.module.ts
├── common/            # Shared utilities
│   ├── services/      # Shared services (Prisma)
│   ├── middleware/    # Request middleware (Auth, CORS, Logger)
│   ├── guards/        # Route guards
│   ├── decorators/    # Custom decorators
│   └── exceptions/    # Custom exception classes
├── config/            # Configuration files
└── utils/             # Helper functions
```

### Key Architectural Patterns

1. **Use Cases Pattern**: Each business operation is isolated in its own use case class
   - Example: `CreateFeedbackUseCase`, `GetUsersListUseCase`
   - Use cases contain the core business logic
   - Services orchestrate use cases, not implement logic directly

2. **DTO Validation with Zod**: All DTOs use `nestjs-zod` for schema validation
   ```typescript
   export const CreateFeedbackSchema = z.object({ ... });
   export class CreateFeedbackDto extends createZodDto(CreateFeedbackSchema) {}
   ```

3. **Response Standardization**: All responses use `successResponse()` utility
   ```typescript
   return successResponse(data, 'Success message');
   ```

4. **Custom Exceptions**: Use custom exception classes in `src/common/exceptions/`
   - These format errors consistently with status codes

### Module Creation Pattern

When creating a new module, follow this structure:

```
src/core/{module}/
├── dto/
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   ├── get-{entities}-list.dto.ts
│   ├── response-schemas.dto.ts
│   └── index.ts
├── use-cases/
│   ├── create-{entity}.use-case.ts
│   ├── get-{entities}-list.use-case.ts
│   ├── get-{entity}-by-id.use-case.ts
│   ├── update-{entity}.use-case.ts
│   ├── delete-{entity}.use-case.ts
│   └── index.ts
├── {module}.controller.ts  # Versioned: {Module}ControllerV1
├── {module}.service.ts     # Delegates to use cases
└── {module}.module.ts
```

### Prisma Integration

- Prisma Client is generated to `generated/prisma` (custom output path)
- `PrismaService` extends `PrismaClient` with NestJS lifecycle hooks
- All database operations go through PrismaService injected into use cases
- Schema location: `prisma/schema.prisma`

### API Versioning

- Controllers use NestJS URI versioning: `@Controller({ path: 'resource', version: '1' })`
- Controller classes named with version suffix: `UserControllerV1`, `FeedbackControllerV1`
- Routes are prefixed with `/api/v{version}/` (configured in `main.ts`)
- Swagger docs mounted at `/api/v{version}/docs`

### Authentication & Security

- JWT-based authentication with Passport.js
- Passwords hashed with bcryptjs

### Middleware Order

Applied in `AppModule.configure()`:
1. `LoggerMiddleware` - Request/response logging
2. `CorsMiddleware` - CORS handling

### Swagger Documentation

- Configured in `src/config/swagger.config.ts`
- Uses Bearer Auth scheme
- All controllers tagged with `@ApiTags()`
- All endpoints documented with `@ApiOperation()` and `@ApiResponse()`
- Response examples included in decorators

## Environment Variables

Required variables (see `.env.example`):
```
DATABASE_URL          # PostgreSQL connection string
APP_NAME              # Application name
APP_PORT              # Server port (default: 3003)
APP_VERSION           # API version (default: "1")
APP_PREFIX            # API prefix (default: "api")
NODE_ENV              # Environment (development/production)
```

## Important Notes

- **Never commit `.env`** - contains database credentials and tokens
- **Use `pnpm`** not `npm` or `yarn` - this project uses pnpm
- **After schema changes**: Always run `npx prisma generate` before starting the app
- **Swagger UI**: Access at `http://localhost:{PORT}/api/v{VERSION}/docs`
- **Response Format**: All API responses follow standardized format from `response.utils.ts`
