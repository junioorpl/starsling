#!/bin/bash

# StarSling Development Startup Script
echo "🚀 Starting StarSling Development Environment..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from Docker template..."
    cp env.docker.example .env.local
    echo "📝 Please update .env.local with your actual values before continuing."
    echo "   Required: GitHub OAuth App credentials, GitHub App credentials, Inngest keys"
    echo "   See env.docker.example for detailed setup instructions"
    read -p "Press Enter to continue after updating .env.local..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Start the development environment
echo "🐳 Starting Docker containers..."
docker-compose up --build

echo "✅ Development environment started!"
echo "🌐 Application: http://localhost:3000"
echo "🗄️  Database: localhost:5432"
echo "📊 Drizzle Studio: npm run db:studio"
