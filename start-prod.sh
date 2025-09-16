#!/bin/bash

# StarSling Production Startup Script
echo "🚀 Starting StarSling Production Environment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production not found. Creating from template..."
    cp env.example .env.production
    echo "📝 Please update .env.production with your production values before continuing."
    echo "   Required: Production database credentials, secure secrets, production URLs"
    read -p "Press Enter to continue after updating .env.production..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Load production environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Start the production environment
echo "🐳 Starting Docker containers in production mode..."
docker-compose -f docker-compose.prod.yml up --build -d

echo "✅ Production environment started!"
echo "🌐 Application: http://localhost:3000"
echo "🗄️  Database: localhost:5432"
echo "📊 Check logs: docker-compose -f docker-compose.prod.yml logs -f"
