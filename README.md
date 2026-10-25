# Project Review Backend

Backend REST API for the Project Review application, built with Express, TypeScript, Prisma, and PostgreSQL.

## Prerequisites

Ensure you have the following installed locally:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (or `npm`)
- [PostgreSQL](https://www.postgresql.org/) (or [Docker](https://www.docker.com/) to run PostgreSQL via Docker Compose)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Arnab-Gupta11/project_review_backend.git
cd project_review_backend
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file by copying the sample environment configuration:

```bash
cp .env.example .env
```

Update the `.env` variables if your local database credentials or ports differ.

### 4. Database Setup

#### Option A: Using Docker Compose (Recommended)

Start the local PostgreSQL container:

```bash
pnpm docker:up
```

#### Option B: Using Local PostgreSQL

Ensure PostgreSQL is running locally and matches the `DATABASE_URL` in your `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/project_review_db?schema=public
```

#### Run Prisma Migrations

Generate the Prisma Client and push the database schema:

```bash
pnpm db:generate
pnpm db:push
```

### 5. Seed Initial Data

Seed the default administrator account into the database:

```bash
pnpm seed
```

**Default Admin Credentials:**

- **Email:** `admin@gmail.com`
- **Password:** `admin123456`
- **Role:** `ADMIN`

### 6. Start the Server

Run the application in development mode with live reloading:

```bash
pnpm dev
```

The server will start at `http://localhost:5000`.

## Available Scripts

| Script        | Command            | Description                                |
| ------------- | ------------------ | ------------------------------------------ |
| `dev`         | `pnpm dev`         | Starts development server with live reload |
| `build`       | `pnpm build`       | Compiles TypeScript into `dist/`           |
| `start`       | `pnpm start`       | Runs the compiled production build         |
| `seed`        | `pnpm seed`        | Seeds the initial admin user               |
| `db:generate` | `pnpm db:generate` | Generates Prisma client types              |
| `db:push`     | `pnpm db:push`     | Syncs Prisma schema with database          |
| `db:migrate`  | `pnpm db:migrate`  | Creates and applies Prisma migrations      |
| `db:studio`   | `pnpm db:studio`   | Launches Prisma Studio GUI                 |
| `docker:up`   | `pnpm docker:up`   | Starts Dockerized PostgreSQL database      |
| `docker:down` | `pnpm docker:down` | Stops Dockerized PostgreSQL database       |
| `lint`        | `pnpm lint`        | Runs ESLint check                          |
| `format`      | `pnpm format`      | Formats code with Prettier                 |

## API Documentation & Health

- **Health Check:** `http://localhost:5000/health`
- **Database Status:** `http://localhost:5000/health/ready`
- **Swagger Documentation:** `http://localhost:5000/api-docs`
