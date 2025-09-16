# 🚀 StarSling Quick Start Guide

Get StarSling running in under 5 minutes with Docker!

## Prerequisites

- Docker Desktop installed and running
- GitHub account (for OAuth App and GitHub App)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd starsling
cp env.example .env.local
```

### 2. Configure GitHub Apps

#### GitHub OAuth App (for user sign-in)
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: StarSling
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env.local`

#### GitHub App (for organization integration)
1. Go to [GitHub Developer Settings](https://github.com/settings/apps)
2. Click "New GitHub App"
3. Fill in:
   - **GitHub App name**: StarSling GitHub Test
   - **Homepage URL**: `http://localhost:3000`
   - **Webhook URL**: `http://localhost:3000/api/github/webhook`
   - **Callback URL**: `http://localhost:3000/api/github/callback`
4. Set permissions: Issues (Read & Write), Metadata (Read)
5. Subscribe to webhook events: Issues (opened, edited, closed, reopened)
6. Generate private key and copy all credentials to `.env.local`

### 3. Configure Inngest

1. Go to [Inngest Dashboard](https://app.inngest.com)
2. Create a new app
3. Copy Event Key and Signing Key to `.env.local`

### 4. Update Environment Variables

Edit `.env.local` and add your credentials:

```env
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

# Security (generate secure random strings)
BETTER_AUTH_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-32-character-encryption-key
```

### 5. Start the Application

```bash
# Start everything with one command
./start-dev.sh

# OR manually
npm run docker:dev
```

### 6. Access the Application

- **Application**: http://localhost:3000
- **Database**: localhost:5432 (user: starsling, password: starsling_password)
- **Drizzle Studio**: `npm run db:studio` (in another terminal)

## What's Included

✅ **Next.js App** with live reload  
✅ **PostgreSQL Database** with persistent data  
✅ **GitHub OAuth** for user authentication  
✅ **GitHub App** for organization integration  
✅ **Webhook Processing** with Inngest  
✅ **Secure Token Storage** with encryption  

## Troubleshooting

### Docker Issues
```bash
# Test Docker setup
npm run docker:test

# Clean up and restart
npm run docker:clean
npm run docker:dev
```

### Database Issues
```bash
# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
npm run docker:dev
```

### Application Issues
```bash
# Check application logs
docker-compose logs app

# Rebuild containers
docker-compose up --build
```

## Next Steps

1. **Sign in** with your GitHub account
2. **Connect GitHub** organization on the integrations page
3. **Test webhooks** by creating/updating issues in your connected repos
4. **Explore the code** to understand the architecture

Happy coding! 🎉
