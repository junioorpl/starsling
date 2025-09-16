#!/bin/bash

# Test Docker setup
echo "🧪 Testing Docker setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed."
    exit 1
fi

# Test build
echo "🔨 Testing Docker build..."
if docker-compose build --no-cache; then
    echo "✅ Docker build successful"
else
    echo "❌ Docker build failed"
    exit 1
fi

# Test database connection
echo "🗄️  Testing database connection..."
if docker-compose up -d postgres; then
    echo "✅ PostgreSQL started successfully"
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    sleep 10
    
    # Test database connection
    if docker-compose exec postgres pg_isready -U starsling -d starsling; then
        echo "✅ Database connection successful"
    else
        echo "❌ Database connection failed"
    fi
    
    # Clean up
    docker-compose down
else
    echo "❌ Failed to start PostgreSQL"
    exit 1
fi

echo "🎉 Docker setup test completed successfully!"
