#!/bin/bash

# Railway Deployment Quick Start
# Run this after setting environment variables in Railway dashboard

echo "🚀 Starting database setup..."

# Wait for database to be ready
sleep 5

# Run migrations (assuming they're in backend/migrations)
echo "📦 Running database migrations..."
npm run seed:admin --workspace=backend

echo "✅ Deployment ready! Your app is live."
