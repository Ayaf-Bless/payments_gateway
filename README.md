## dfcu PayGat Payments Gateway

Welcome to the lightweight Payments Gateway project at dfcu Bank. This README will help you get up and running, guide you through running the application and its tests, and illustrate how this solution fulfills the interview assignment requirements.

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

The Gateway implements the two core APIs defined in the interview:

1. **Payment Initiation API**

   - **Endpoint**: `POST /api/v1/payments`
   - **Parameters**:

     - `payer` (10-digit account number)
     - `payee` (10-digit account number)
     - `amount` (number)
     - `currency` (ISO code)
     - `payerReference` (optional narration)

   - **Behavior**:

     - Simulates processing outcomes with configurable probabilities:

       - Pending: 10%
       - Successful: 85%
       - Failed: 5%

     - Enforces a **minimum response time of 100 ms** on every request to mimic real-world latency.

   - **Response**:

     - `100 PENDING` – "Transaction Pending"
     - `200 SUCCESSFUL` – "Transaction successfully processed"
     - `400 FAILED` – "Transaction failed {error message}"
     - Each response includes a unique transaction reference and descriptive message.

2. **Payment Status Check API**

   - **Endpoint**: `GET /api/v1/payments/{transactionReference}`
   - **Response**: Returns the stored status (`PENDING` | `SUCCESSFUL` | `FAILED`) immediately. No artificial delay imposed.

A simple Next.js client in `frontend/` demos consuming both APIs, allowing you to initiate payments and poll status.

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
│   ├── src/           # NestJS application code (controllers, services, simulation logic)
│   ├── test/          # Unit & integration tests covering all API behaviors
│   └── ...
├── frontend/
│   ├── app/           # Next.js pages: initiate payment & status polling UI
│   ├── components/    # Reusable React components
│   └── ...
└── infrastructure/
    ├── docker-compose.yml  # PostgreSQL service
    └── .env.example        # Environment variable template
```

---

## 🛠️ Prerequisites

- **Node.js** v16+ and **npm**
- **Docker** & **Docker Compose** (for PostgreSQL)

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
   # Fill in DB connection, JWT secrets, etc.
   ```

3. **Start application**

   ```bash
   npm run start:dev
   ```

4. **Run tests**

   ```bash
   npm run test
   ```

> 💡 To launch a local PostgreSQL instance:
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
   # Set API_BASE_URL to backend URL
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

Access the client at `http://localhost:3000` to initiate transactions and view statuses.

---

## 📑 API Endpoints

### Authentication

| Method | Path                    | Description                                 |
| ------ | ----------------------- | ------------------------------------------- |
| POST   | `/api/v1/auth/register` | Register a new user                         |
| POST   | `/api/v1/auth/login`    | Authenticate user and receive JWT           |
| GET    | `/api/v1/auth/me`       | Get current user info (requires Bearer JWT) |

### Payments

| Method | Path                                      | Description                                                            |
| ------ | ----------------------------------------- | ---------------------------------------------------------------------- |
| POST   | `/api/v1/payments`                        | Initiate a new payment (with simulated latency and randomized outcome) |
| GET    | `/api/v1/payments`                        | List all payments (paginated)                                          |
| GET    | `/api/v1/payments/stats`                  | Dashboard statistics                                                   |
| GET    | `/api/v1/payments/transactions`           | Recent transactions                                                    |
| GET    | `/api/v1/payments/{transactionReference}` | Check payment status by transaction reference                          |

---

## 🛡️ Security & Best Practices

- **Caching**: In-memory cache (future Redis integration).
- **Security Headers**: Helmet middleware.
- **Rate Limiting**: 100 requests/15 min per IP.
- **CORS**: Environment-based allowed origins.
- **CSRF Protection**: `csurf` in production.
- **Validation**: Reject unknown properties (`forbidNonWhitelisted`).
- **HTTPS Enforcement**: HTTP-to-HTTPS redirect in production.
- **Request Size Limits**: 100 KB JSON bodies.
- **Env Validation**: Mandatory checks via `ConfigService`.
- **Swagger**: Protected API docs (JWT), enabled only outside production.
- **Error Handling**: Global exception filter.
- **Authentication**: JWT Bearer.
- **Throttling**: NestJS throttle guard on critical routes.

---

## 📋 Interview Assignment Compliance

1. **Core APIs**: Implemented exactly as specified—initiation with correct params, status check by reference.
2. **Simulation Rules**: Randomized outcomes (10% pending, 85% success, 5% failure) with enforced 100 ms min latency.
3. **RDBMS Persistence**: Transactions stored/retrieved via PostgreSQL.
4. **Client Demo**: Simple Next.js web app consuming both APIs (initiate + poll status).
5. **Production-Grade Quality**: Comprehensive testing, security hardening (headers, rate limiting, CSRF), validation, and documentation.
6. **Documentation & Deployment Guide**: This README, in-repo docs, and `.github/workflows` for CI/CD.
7. **Public Repository**: All code committed here, ready for review or deployment.

---

## 🎉 Achievements

- Exceeded basic requirements with robust error handling, security, and organized code structure.
- Delivered a clear, maintainable TypeScript codebase for both backend and frontend.
- Ensured full test coverage for critical flows and edge cases.
- Set up CI/CD pipelines for seamless integration and deployment.

---

Thank you for reviewing this implementation. We’re proud of how this Gateway addresses the interview assignment and lays the groundwork for scalable payment services at dfcu Bank!
