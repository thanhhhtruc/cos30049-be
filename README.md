# COS30049 Blockchain-based Cryptocurrency Exchange Backend

Fast, scalable NestJS backend for a cryptocurrency exchange platform with EdgeDB and Neo4j integration.

## Prerequisites

- Node.js 18+ and pnpm
- EdgeDB 5.x
- Neo4j 5.x (optional, for advanced relationship queries)
- Docker and Docker Compose (recommended for local development)

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Database Setup

```bash
# Initialize EdgeDB
edgedb project init

# Run migrations
pnpm run db:migrate

# Generate TypeScript interfaces
pnpm run db:generate

# Seed the database (optional)
pnpm run db:seed
```

### Running the Application

```bash
# Development mode with hot reload
pnpm run dev

# Production build
pnpm run build
pnpm run start
```

## API Documentation

Once the application is running, access the Swagger documentation at:

```
http://localhost:3000/api/docs
```

## Common Issues

- **EdgeDB Connection Error**: Ensure EdgeDB is running and credentials in `.env` are correct
- **Hot Reload Not Working**: Check that the webpack-hmr.config.js is properly configured
- **Database Migration Fails**: Run `edgedb migration create --dev-mode` to debug migration issues

## Project Structure

```
src/
├── common/         # Shared utilities, guards, and decorators
├── config/         # Application configuration
├── modules/        # Feature modules (auth, users, wallets, etc.)
│   ├── auth/       # Authentication and authorization
│   ├── users/      # User management
│   ├── wallets/    # Cryptocurrency wallets
│   └── ...
└── main.ts         # Application entry point
```

## Additional Documentation

- [Architecture Overview](docs/architecture.md)
- [Data Models](docs/data-models.md)
- [API Documentation](docs/api-documentation.md)

## Development

```bash
# Linting
pnpm run lint

# Formatting
pnpm run format
```

## License

[MIT](LICENSE)
