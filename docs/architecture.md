# Architecture for COS30049 Blockchain-based Cryptocurrency Exchange

## Technical Summary

This architecture defines a scalable, maintainable backend for a blockchain-based cryptocurrency exchange platform. The system employs a modular architecture using NestJS to ensure high maintainability, scalability, and testability while supporting cryptocurrency wallet management, transaction tracking, and user authentication.

## Technology Table

| Technology | Description                                                         |
| :--------- | :------------------------------------------------------------------ |
| NestJS     | Progressive Node.js framework for building server-side applications |
| EdgeDB     | Next-generation graph-relational database for data storage          |
| Neo4j      | Graph database for complex relationship queries                     |
| TypeScript | Typed JavaScript for better developer experience                    |
| JWT        | JSON Web Tokens for secure authentication                           |
| Swagger    | API documentation and testing                                       |
| Zod        | Schema validation library                                           |
| Pino       | Logging library                                                     |
| Docker     | Containerization for consistent deployment                          |

## Architectural Diagrams

### System Architecture

```mermaid
---
title: System Architecture
---
graph TD
    Client[Client Applications] --> API[API Gateway]
    API --> AuthService[Authentication Service]
    API --> UserService[User Service]
    API --> WalletService[Wallet Service]
    API --> TransactionService[Transaction Service]
    API --> CurrencyService[Currency Service]
    API --> ExchangeRateService[Exchange Rate Service]

    AuthService --> EdgeDB[(EdgeDB)]
    UserService --> EdgeDB
    WalletService --> EdgeDB
    TransactionService --> EdgeDB
    WalletService --> Neo4j[(Neo4j)]
    TransactionService --> Neo4j

    subgraph "Data Layer"
        EdgeDB
        Neo4j
    end

    subgraph "Service Layer"
        AuthService
        UserService
        WalletService
        TransactionService
        CurrencyService
        ExchangeRateService
    end
```

### Authentication Flow

```mermaid
---
title: Authentication Flow
---
sequenceDiagram
    participant Client
    participant API as API Gateway
    participant Auth as Auth Service
    participant DB as EdgeDB

    Client->>API: POST /auth/login
    API->>Auth: Validate credentials
    Auth->>DB: Query user
    DB->>Auth: Return user data
    Auth->>Auth: Verify password
    Auth->>Auth: Generate JWT tokens
    Auth->>Client: Return tokens

    Note over Client,Auth: Later, when token expires

    Client->>API: GET /auth/refresh
    API->>Auth: Validate refresh token
    Auth->>DB: Verify token in DB
    DB->>Auth: Confirm token validity
    Auth->>Auth: Generate new access token
    Auth->>Client: Return new access token
```

### Transaction Query Flow

```mermaid
---
title: Transaction Query Flow
---
sequenceDiagram
    participant Client
    participant API as API Gateway
    participant WalletSvc as Wallet Service
    participant TransSvc as Transaction Service
    participant EdgeDB
    participant Neo4j

    Client->>API: GET /wallets/{address}/transactions
    API->>WalletSvc: Validate wallet address
    WalletSvc->>EdgeDB: Query wallet
    EdgeDB->>WalletSvc: Return wallet data
    WalletSvc->>TransSvc: Get transactions for wallet
    TransSvc->>EdgeDB: Query basic transaction data
    EdgeDB->>TransSvc: Return transaction data
    TransSvc->>Neo4j: Query complex relationship data
    Neo4j->>TransSvc: Return relationship data
    TransSvc->>API: Combine and return data
    API->>Client: Return transaction data
```

## Project Structure

```
/
├── /src
│   ├── /main.ts                # Application entry point
│   ├── /common                 # Shared utilities and middleware
│   │   ├── /decorators         # Custom decorators
│   │   ├── /filters            # Exception filters
│   │   ├── /guards             # Authorization guards
│   │   ├── /interceptors       # Response transformers
│   │   ├── /logger             # Logging configuration
│   │   └── /seeder             # Database seeders
│   ├── /modules                # Feature modules
│   │   ├── /app.module.ts      # Root module
│   │   ├── /auth               # Authentication
│   │   ├── /user               # User management
│   │   ├── /wallet             # Wallet operations
│   │   ├── /transaction        # Transaction handling
│   │   ├── /currency           # Currency information
│   │   ├── /exchange-rate      # Exchange rate data
│   │   ├── /edgedb             # EdgeDB connection
│   │   └── /neo4j              # Neo4j connection
│   └── /scripts                # Utility scripts
├── /dbschema                   # EdgeDB schema definitions
│   ├── /default.esdl           # Main schema file
│   ├── /migrations             # Database migrations
│   └── /edgeql-js              # Generated EdgeDB queries
├── /dist                       # Compiled output
├── /node_modules               # Dependencies
├── /docs                       # Documentation
├── .env                        # Environment variables
├── package.json                # Project metadata and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project overview
```

## Key Design Decisions

### 1. Dual Database Approach

**Decision**: Use both EdgeDB and Neo4j for different aspects of data storage and querying.

**Rationale**:

- EdgeDB provides strong typing and schema validation for structured data
- Neo4j excels at relationship queries needed for transaction graph analysis
- This combination offers the best of both worlds for cryptocurrency data

### 2. Modular Architecture

**Decision**: Organize code into feature modules following NestJS best practices.

**Rationale**:

- Improves maintainability by separating concerns
- Enables independent development of features
- Facilitates testing and code reuse

### 3. JWT Authentication

**Decision**: Use JWT tokens with refresh token rotation for authentication.

**Rationale**:

- Stateless authentication reduces database load
- Refresh tokens enable longer sessions without compromising security
- Industry standard approach for API authentication

### 4. API Documentation with Swagger

**Decision**: Automatically generate API documentation using Swagger.

**Rationale**:

- Keeps documentation in sync with code
- Provides interactive testing interface
- Improves developer experience

## Performance Considerations

1. **Database Indexing**: Critical fields like wallet addresses and transaction hashes are indexed for fast lookups.

2. **Caching Strategy**: Frequently accessed data like exchange rates can be cached to reduce database load.

3. **Pagination**: All list endpoints support pagination to handle large datasets efficiently.

4. **Query Optimization**: Complex graph queries are optimized to minimize processing time.

## Security Measures

1. **Authentication**: JWT-based authentication with proper token expiration.

2. **Password Handling**: Passwords are hashed using bcrypt before storage.

3. **Input Validation**: All inputs are validated using Zod schemas.

4. **Rate Limiting**: API endpoints are protected against abuse with rate limiting.

5. **CORS Configuration**: Cross-Origin Resource Sharing is properly configured.

## Deployment Strategy

The application is designed to be deployed in a containerized environment using Docker, with separate containers for:

1. NestJS API
2. EdgeDB database
3. Neo4j database

This enables easy scaling of individual components as needed.
