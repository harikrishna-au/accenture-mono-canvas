#!/bin/bash

# Communication Assessment Backend - AWS Lambda Deployment Script
# This script deploys the FastAPI backend to AWS Lambda using AWS SAM

set -e  # Exit on error

echo "🚀 Starting deployment to AWS Lambda..."

# Check if AWS SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "❌ AWS SAM CLI is not installed."
    echo "📦 Install it with: brew install aws-sam-cli"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured."
    echo "🔧 Run: aws configure"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Build the SAM application
echo "📦 Building SAM application..."
sam build

# Deploy the application
echo "🚀 Deploying to AWS Lambda..."
if [ "$1" == "--guided" ]; then
    sam deploy --guided
else
    sam deploy
fi

# Get the API endpoint
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Getting API endpoint..."
API_URL=$(aws cloudformation describe-stacks \
    --stack-name communication-assessment-backend \
    --query 'Stacks[0].Outputs[?OutputKey==`CommunicationApiUrl`].OutputValue' \
    --output text)

echo ""
echo "🎉 Backend deployed successfully!"
echo "📍 API Endpoint: $API_URL"
echo ""
echo "Next steps:"
echo "1. Update your frontend .env file:"
echo "   VITE_BACKEND_URL=$API_URL"
echo "2. Test the API:"
echo "   curl $API_URL"
echo "3. Rebuild and redeploy your frontend"
