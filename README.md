<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository with Prisma ORM integration.

## Features

- 🎮 **Gaming Room Management**: Create and manage gaming rooms with rank-based matchmaking
- 🔐 **Authentication**: JWT-based authentication with role-based access control
- 🤖 **Discord Bot Integration**: Necord-powered Discord bot with slash commands
- 📊 **Health Checks**: Built-in health monitoring for database and services
- 🔒 **Security**: Rate limiting, CORS, security headers, and more
- 📝 **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- 🗄️ **Prisma ORM**: Type-safe database access with migrations

## Discord Bot Setup

This application includes a Discord bot integration using [Necord](https://necord.org/).

### Quick Setup

1. **Create a Discord Bot**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application and add a bot
   - Copy the bot token

2. **Add Environment Variables**:
```env
DISCORD_BOT_TOKEN=your-discord-bot-token-here
DISCORD_DEVELOPMENT_GUILD_ID=your-guild-id-for-testing
```

3. **Invite Bot to Server**:
   - Use OAuth2 URL Generator with `bot` and `applications.commands` scopes
   - Grant necessary permissions (Send Messages, Embed Links, Use Slash Commands)

4. **Start the Application**:
```bash
pnpm run start:dev
```

### Available Discord Commands

- `/games` - List all available games with filters
- `/game <id>` - Get detailed information about a specific game

For detailed Discord bot documentation, see [src/discord/README.md](src/discord/README.md)

## Prisma Setup

This project uses Prisma as the ORM. Follow these steps to set up Prisma:

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Database

Create a `.env` file in the root directory with your database connection:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
```

### 3. Generate Prisma Client

```bash
pnpm prisma generate
```

### 4. Run Migrations

For development (creates migration files):
```bash
pnpm prisma migrate dev --name init
```

For production (applies existing migrations):
```bash
pnpm prisma migrate deploy
```

Or use push for quick schema sync without migrations:
```bash
pnpm prisma db push
```

## API Documentation

### User Module API (v1)

The User module follows a **Module → Controller → Service → Use Case** architecture pattern.

#### Base URL
All user endpoints are prefixed with: `/api/v1/user`

#### Endpoints

##### 1. Create User
- **Method**: `POST /api/v1/user`
- **Description**: Creates a new user
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "john_doe",
  "password": "secret123",
  "roles": ["user"]
}
```
- **Response** (201):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "username": "john_doe",
    "roles": ["user"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "notes": 0
    }
  }
}
```

##### 2. Get User by ID
- **Method**: `GET /api/v1/user/id/:id`
- **Description**: Retrieves a user by ID with their notes
- **Response** (200):
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "username": "john_doe",
    "roles": ["user"],
    "notes": [],
    "_count": {
      "notes": 0
    }
  }
}
```

##### 3. Get User by Username
- **Method**: `GET /api/v1/user/username/:username`
- **Description**: Retrieves a user by username with their notes

##### 4. Get Users List
- **Method**: `GET /api/v1/user/list`
- **Description**: Retrieves paginated list of users
- **Query Parameters**:
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 10, max: 100): Items per page
  - `search` (optional): Search by username (case-insensitive)
- **Response** (200):
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [...],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

##### 5. Update User
- **Method**: `PUT /api/v1/user/:id`
- **Description**: Updates an existing user
- **Request Body** (all fields optional):
```json
{
  "name": "John Doe Updated",
  "email": "newemail@example.com",
  "username": "john_updated",
  "password": "newpassword123",
  "roles": ["user", "admin"]
}
```

##### 6. Delete User
- **Method**: `DELETE /api/v1/user/:id`
- **Description**: Deletes a user (cascade deletes related notes)
- **Response** (200):
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": 1,
    "message": "User deleted successfully"
  }
}
```

##### 7. Update or Create User
- **Method**: `PUT /api/v1/user/update-or-create`
- **Description**: Updates user by username or creates if not exists
- **Request Body**:
```json
{
  "username": "john_doe"
}
```

#### Architecture

```
UserModule
├── UserController (handles HTTP requests)
├── UserService (orchestrates use cases)
└── Use Cases
    ├── CreateUserUseCase
    ├── UpdateUserUseCase
    ├── GetUserByIdUseCase
    ├── GetUserByUsernameUseCase
    ├── GetUsersListUseCase
    ├── DeleteUserUseCase
    └── UpdateOrCreateUserUseCase
```

#### Data Validation

All DTOs use Zod schemas via `nestjs-zod` for validation:
- Username: 3-50 chars, alphanumeric with _ and -
- Email: Valid email format, max 100 chars
- Password: Min 6 chars (optional, hashed with argon2)
- Name: 2-100 chars

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
