# StarSling - GitHub Integration Takehome Project

StarSling is "Cursor for DevOps" - a platform that builds agents to perform actions like debugging issues, managing deployments, or resolving incidents autonomously.

This project demonstrates a Next.js application with GitHub OAuth authentication, GitHub App integration, and PostgreSQL database integration.

## Features

- **User Authentication**: GitHub OAuth sign-in using BetterAuth
- **GitHub App Integration**: Organization-level GitHub App installation
- **Webhook Processing**: Real-time GitHub event handling with Inngest
- **Secure Token Storage**: Encrypted token storage at rest
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: BetterAuth with GitHub OAuth
- **Background Jobs**: Inngest for webhook processing
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Prerequisites

Before running this application, you'll need:

1. **PostgreSQL Database**: Local or hosted (Supabase, Railway, etc.)
2. **GitHub OAuth App**: For user authentication
3. **GitHub App**: For organization integration
4. **Inngest Account**: For background job processing

## Setup Instructions

### Option 1: Docker (Recommended)

The easiest way to get started is with Docker, which includes PostgreSQL and live reload:

```bash
# Clone the repository
git clone <repository-url>
cd starsling

# Copy environment variables
cp env.docker.example .env.local

# Update .env.local with your credentials
# Required: GitHub OAuth App, GitHub App, Inngest keys

# Start development environment
./start-dev.sh
# OR
npm run docker:dev
```

### Option 2: Local Development

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd starsling
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp env.example .env.local
```

Update `.env.local` with your actual values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/starsling"

# BetterAuth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth App (for user sign-in)
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"

# GitHub App (for organization integration)
GITHUB_APP_ID="your-github-app-id"
GITHUB_APP_CLIENT_ID="your-github-app-client-id"
GITHUB_APP_CLIENT_SECRET="your-github-app-client-secret"
GITHUB_APP_PRIVATE_KEY="your-github-app-private-key"
GITHUB_WEBHOOK_SECRET="your-github-webhook-secret"

# Inngest
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"

# Encryption
ENCRYPTION_KEY="your-32-character-encryption-key"
```

### 3. Set Up GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: StarSling
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local`

### 4. Set Up GitHub App

1. Go to [GitHub Developer Settings](https://github.com/settings/apps)
2. Click "New GitHub App"
3. Fill in:
   - **GitHub App name**: StarSling GitHub Test
   - **Homepage URL**: `http://localhost:3000`
   - **Webhook URL**: `http://localhost:3000/api/github/webhook`
   - **Callback URL**: `http://localhost:3000/api/github/callback`
4. Set permissions:
   - **Issues**: Read & Write
   - **Metadata**: Read
5. Subscribe to webhook events:
   - **Issues**: opened, edited, closed, reopened
6. Generate a private key and copy it to your `.env.local`
7. Copy the App ID, Client ID, and Client Secret

### 5. Set Up Inngest

1. Go to [Inngest Dashboard](https://app.inngest.com)
2. Create a new app
3. Copy the Event Key and Signing Key to your `.env.local`

### 6. Set Up Database

```bash
# Generate database migrations
npm run db:generate

# Push schema to database
npm run db:push
```

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. **Sign In**: Visit the homepage and click "Sign in with GitHub"
2. **View Integrations**: Navigate to `/integrations` to see available integrations
3. **Connect GitHub**: Click "Connect GitHub" to install the GitHub App for your organization
4. **Manage Integration**: View connection status, permissions, and manage the integration

## API Endpoints

- `GET /api/auth/sign-in/github` - Initiate GitHub OAuth flow
- `GET /api/github/auth` - Initiate GitHub App OAuth flow
- `GET /api/github/callback` - Handle GitHub App OAuth callback
- `POST /api/github/webhook` - Handle GitHub webhooks
- `POST /api/github/disconnect` - Disconnect GitHub integration
- `POST /api/inngest` - Inngest webhook endpoint

## Database Schema

### integration_installations

| Column          | Type        | Description                   |
| --------------- | ----------- | ----------------------------- |
| id              | uuid        | Primary key                   |
| organization_id | uuid        | Organization identifier       |
| provider        | varchar(50) | Integration provider (github) |
| access_token    | text        | Encrypted access token        |
| refresh_token   | text        | Encrypted refresh token       |
| metadata        | jsonb       | Installation metadata         |
| created_at      | timestamp   | Creation timestamp            |
| updated_at      | timestamp   | Last update timestamp         |

## Security Features

- **Token Encryption**: All tokens are encrypted at rest using AES encryption
- **Webhook Verification**: GitHub webhook signatures are verified
- **Session Management**: Secure session handling with BetterAuth
- **CSRF Protection**: Built-in CSRF protection

## Development

### Docker Commands

```bash
# Start development environment
npm run docker:dev
# OR
./start-dev.sh

# Start production environment
npm run docker:prod
# OR
./start-prod.sh

# Stop containers
npm run docker:down

# Clean up (remove volumes and images)
npm run docker:clean
```

### Database Management

```bash
# View database in Drizzle Studio
npm run db:studio

# Generate new migrations
npm run db:generate

# Apply migrations
npm run db:migrate
```

### Linting

```bash
npm run lint
```

## Docker

### Development Environment

The development environment includes:

- **Next.js app** with live reload
- **PostgreSQL database** with persistent data
- **Automatic database setup** on first run

```bash
# Quick start
./start-dev.sh

# Manual start
docker-compose up --build
```

### Production Environment

```bash
# Start production
./start-prod.sh

# Manual start
docker-compose -f docker-compose.prod.yml up --build -d
```

### Environment Variables

Create `.env.local` for development or `.env.production` for production:

```env
# Database (Docker)
POSTGRES_PASSWORD=your-secure-password

# GitHub OAuth App
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret

# GitHub App
GITHUB_APP_ID=your-github-app-id
GITHUB_APP_CLIENT_ID=your-github-app-client-id
GITHUB_APP_CLIENT_SECRET=your-github-app-client-secret
GITHUB_APP_PRIVATE_KEY=your-github-app-private-key
GITHUB_WEBHOOK_SECRET=your-github-webhook-secret

# Inngest
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# Security
BETTER_AUTH_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-32-character-encryption-key
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to update the following URLs for production:

- `BETTER_AUTH_URL`: Your production domain
- GitHub OAuth App callback URL
- GitHub App callback and webhook URLs

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and accessible
2. **GitHub OAuth**: Verify callback URLs match exactly
3. **GitHub App**: Check permissions and webhook configuration
4. **Inngest**: Ensure event keys are correct

### Logs

Check the console for detailed error messages and webhook processing logs.
