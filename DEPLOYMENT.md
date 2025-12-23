# AWS Lambda Deployment Guide

## ✅ Prerequisites Installed
- ✅ AWS CLI (v2.32.22)
- ⏳ AWS SAM CLI (check if installation completed)

## Step 1: Configure AWS Credentials

Run this command and enter your AWS credentials:
```bash
aws configure
```

You'll be asked for:
1. **AWS Access Key ID**: Get this from AWS Console → IAM → Users → Security Credentials
2. **AWS Secret Access Key**: Shown when you create the access key
3. **Default region**: Enter `ap-south-1` (or your preferred region)
4. **Default output format**: Enter `json`

## Step 2: Update SAM Configuration

Edit `samconfig.toml` and replace the placeholder credentials:
```toml
parameter_overrides = "AWSAccessKeyId=\"YOUR_ACCESS_KEY\" AWSSecretAccessKey=\"YOUR_SECRET_KEY\""
```

**OR** better yet, use environment variables (more secure):

Create a `.env.aws` file:
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="ap-south-1"
```

Then load it before deploying:
```bash
source .env.aws
```

## Step 3: Deploy to Lambda

Run the deployment script:
```bash
./deploy.sh --guided
```

This will:
1. Build your FastAPI application
2. Package it for Lambda
3. Deploy to AWS
4. Create API Gateway endpoint
5. Give you the API URL

## Step 4: Update Frontend

After deployment, you'll get an API URL like:
```
https://abc123.execute-api.ap-south-1.amazonaws.com/Prod/
```

Update your frontend `.env` file:
```bash
VITE_BACKEND_URL=https://abc123.execute-api.ap-south-1.amazonaws.com/Prod
```

Then rebuild your frontend:
```bash
npm run build
```

## Step 5: Test the Deployment

Test the API:
```bash
curl https://your-api-url.amazonaws.com/Prod/
```

You should see:
```json
{
  "status": "online",
  "message": "Communication Backend Active with Azure AI"
}
```

## Troubleshooting

### Issue: "Unable to locate credentials"
**Solution**: Run `aws configure` and enter your credentials

### Issue: "Access Denied" errors
**Solution**: Ensure your IAM user has these permissions:
- Lambda full access
- API Gateway full access
- DynamoDB access
- Bedrock access
- CloudFormation access

### Issue: SAM CLI not found
**Solution**: Wait for brew installation to complete, then run:
```bash
sam --version
```

## Cost Monitoring

Check your AWS costs:
```bash
aws ce get-cost-and-usage \
  --time-period Start=2024-12-01,End=2024-12-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

## Rollback

If something goes wrong:
```bash
aws cloudformation delete-stack --stack-name communication-assessment-backend
```

Then update your frontend to use local backend:
```bash
VITE_BACKEND_URL=http://localhost:8000
```
