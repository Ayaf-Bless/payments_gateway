## ViteVendu Payments Gateway

Welcome to the lightweight Payments Gateway project at dfcu Bank. This README will help you get up and running, and guide you through running the application and its tests.

---

### 🚀 Project Overview

This repository is organized into three main directories:

```
my-app/
├── .github/            # CI/CD workflows for backend & frontend
├── backend/            # NestJS API backed by PostgreSQL
├── frontend/           # Next.js client written in TypeScript
└── infrastructure/     # Docker Compose setup for PostgreSQL
```

The Gateway exposes two core APIs:

1. **Payment Initiation API**

   - **Endpoint**: `POST /api/v1/payments`
   - **Parameters**:

     - `payer` (10-digit account number)
     - `payee` (10-digit account number)
     - `amount` (number)
     - `currency` (ISO code)
     - `payerReference` (optional narration)

   - **Response**:

     - `100 PENDING` – "Transaction Pending"
     - `200 SUCCESSFUL` – "Transaction successfully processed"
     - `400 FAILED` – "Transaction failed {error message}"

2. **Payment Status Check API**

   - **Endpoint**: `GET /api/v1/payments/{transactionReference}`
   - **Response**: Returns `PENDING` | `SUCCESSFUL` | `FAILED`

Additional endpoints are available for authentication, statistics, and listing transactions (see **API Endpoints** below).

---

## 📦 Project Structure

```
my-app/
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       ├── backend-cd.yml
│       ├── frontend-ci.yml
│       └── frontend-cd.yml
├── backend/
│   ├── src/           # NestJS application code
│   ├── test/          # Unit & integration tests
│   └── ...
├── frontend/
│   ├── app/         # Next.js pages
│   ├── components/    # Reusable React components
│   └── ...
└── infrastructure/
    ├── docker-compose.yml  # PostgreSQL service
```

---

## 🛠️ Prerequisites

- **Node.js** v16+ and **npm**
- **Docker** & **Docker Compose** (for PostgreSQL instance)

---

## 🔧 Running the Backend

1. **Install dependencies**

   ```bash
   cd my-app/backend
   npm install
   ```

2. **Configure environment**

   ```bash
   cp ../infrastructure/.env.example .env
   # Edit .env with your database credentials, JWT secrets, etc.
   ```

3. **Start application**

   ```bash
   npm run start:dev
   ```

4. **Run tests**

   ```bash
   npm run test
   ```

> 💡 Make sure you have a running PostgreSQL instance. You can spin one up in the `infrastructure/` directory:
>
> ```bash
> cd my-app/infrastructure
> docker-compose up -d
> ```

---

## 🌐 Running the Frontend

1. **Install dependencies**

   ```bash
   cd my-app/frontend
   npm install
   ```

2. **Configure environment**

   ```bash
   cp ../infrastructure/.env.example .env
   # Add API_BASE_URL and other required variables
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

Your frontend will be available at `http://localhost:3000`.

---

## 📑 API Endpoints

### Authentication

| Method | Path                    | Description                                 |
| ------ | ----------------------- | ------------------------------------------- |
| POST   | `/api/v1/auth/register` | Register a new user                         |
| POST   | `/api/v1/auth/login`    | Authenticate user and receive JWT           |
| GET    | `/api/v1/auth/me`       | Get current user info (requires Bearer JWT) |

### Payments

| Method | Path                                      | Description                       |
| ------ | ----------------------------------------- | --------------------------------- |
| POST   | `/api/v1/payments`                        | Initiate a new payment            |
| GET    | `/api/v1/payments`                        | List all payments (paginated)     |
| GET    | `/api/v1/payments/stats`                  | Dashboard statistics              |
| GET    | `/api/v1/payments/transactions`           | Recent transactions               |
| GET    | `/api/v1/payments/{transactionReference}` | Check payment status by reference |

---

## 🛡️ Security & Best Practices

- **Caching**: Currently using in-memory cache. Redis caching can be integrated in future iterations.
- **Security Headers**: Helmet middleware for secure HTTP headers.
- **Rate Limiting**: 100 requests per 15 minutes per IP.
- **CORS**: Environment-based allowed origins.
- **CSRF Protection**: `csurf` middleware enabled in production.
- **Validation**: `forbidNonWhitelisted` to reject unexpected properties.
- **HTTPS Enforcement**: Redirect HTTP to HTTPS in production.
- **Request Size Limits**: JSON bodies limited to 100 KB.
- **Environment Validation**: Mandatory config checks via `ConfigService`.
- **API Documentation**: Swagger UI protected with API Key & JWT, enabled only in non-production.
- **Error Handling**: Global exception filter to prevent leaking sensitive details.
- **Authentication**: Supports API Key + JWT Bearer tokens.
- **Throttling**: Built-in throttle guard in NestJS on critical routes.

---

## 🎉 Achievements

- Proudly built a robust, secure, and scalable Payments Gateway in record time.
- Leveraged NestJS best practices, including Guards, Interceptors, and Exception Filters.
- Developed clear, maintainable TypeScript code on both client and server.
- Implemented comprehensive testing strategy to ensure reliability.

---

Thank you for exploring this project. We’re confident this Gateway sets a strong foundation for dfcu Bank's payment services!
