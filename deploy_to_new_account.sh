#!/bin/bash
set -e

# Backup old samconfig.toml to force a fresh deployment state (avoids bucket permission errors)
if [ -f "samconfig.toml" ]; then
    echo "� Backing up old samconfig.toml..."
    mv samconfig.toml samconfig.toml.user_backup
fi

# Parse credentials safely (handling comments and whitespace)
export AWS_ACCESS_KEY_ID=$(grep AWS_ACCESS_KEY_ID backend/.env | cut -d '#' -f1 | awk -F= '{print $2}' | tr -d ' "[:space:]')
export AWS_SECRET_ACCESS_KEY=$(grep AWS_SECRET_ACCESS_KEY backend/.env | cut -d '#' -f1 | awk -F= '{print $2}' | tr -d ' "[:space:]')
export AWS_DEFAULT_REGION=$(grep AWS_DEFAULT_REGION backend/.env | cut -d '#' -f1 | awk -F= '{print $2}' | tr -d ' "[:space:]')

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ Error: Could not find credentials in backend/.env"
    exit 1
fi

echo "✅ Credentials loaded for account ending in: ...${AWS_ACCESS_KEY_ID: -4}"
echo "🌏 Region: $AWS_DEFAULT_REGION"

echo ""
echo "📦 Building project (Clean Build)..."
rm -rf .aws-sam
sam build

echo ""
echo "🚀 Deploying to NEW ACCOUNT..."
# We use --resolve-s3 to let SAM manage the bucket in the new account
sam deploy --guided

echo ""
echo "🌱 Seeding Database..."
python3 seed_dynamodb.py
