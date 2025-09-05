#!/bin/bash

# Eddie n8n Startup Script
echo "🚀 Starting Eddie Website Transformation System..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Create necessary directories
mkdir -p data
mkdir -p logs
mkdir -p workflows

# Start n8n
echo "🌐 Starting n8n..."
npx n8n start --tunnel

echo "✅ Eddie system is running!"
echo "📊 n8n UI: http://localhost:5678"
echo "🔗 Webhook URL: http://localhost:5678/webhook"
