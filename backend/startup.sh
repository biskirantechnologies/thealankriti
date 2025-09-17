#!/bin/bash
# startup.sh - Production startup script for Render

echo "🚀 Starting Ukriti Jewells Backend..."
echo "📍 Node.js version: $(node --version)"
echo "📍 NPM version: $(npm --version)"
echo "📍 Environment: $NODE_ENV"
echo "📍 Port: $PORT"

# Check if required environment variables are set
if [ -z "$MONGODB_URI" ]; then
    echo "❌ ERROR: MONGODB_URI environment variable is not set!"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERROR: JWT_SECRET environment variable is not set!"
    exit 1
fi

echo "✅ Environment variables check passed"

# Start the server
echo "🔄 Starting server..."
node server.js