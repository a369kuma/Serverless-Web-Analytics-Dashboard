# Deployment Guide

This guide covers the complete deployment process for the Serverless Web Analytics Dashboard.

## Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with appropriate permissions
2. **Node.js 18+** and npm installed
3. **AWS CLI** configured with credentials
4. **Serverless Framework** installed globally
5. **Git** for version control

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd serverless-web-analytics
npm install
cd frontend && npm install && cd ..
```

### 2. Configure AWS

```bash
aws configure
# Enter your AWS credentials and preferred region
```

### 3. Deploy

```bash
# Development deployment
./scripts/deploy.sh dev

# Production deployment
./scripts/deploy.sh prod
```

## Detailed Deployment Steps

### Step 1: Environment Setup

1. **Install Dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Configure AWS Credentials**
   ```bash
   aws configure
   # AWS Access Key ID: [Your Access Key]
   # AWS Secret Access Key: [Your Secret Key]
   # Default region name: us-east-1
   # Default output format: json
   ```

3. **Verify AWS Access**
   ```bash
   aws sts get-caller-identity
   ```

### Step 2: Backend Deployment

1. **Deploy Lambda Functions and API Gateway**
   ```bash
   serverless deploy --stage dev --region us-east-1
   ```

2. **Note the API Gateway URL**
   The deployment will output the API Gateway URL. Save this for frontend configuration.

3. **Verify Deployment**
   ```bash
   serverless info --stage dev
   ```

### Step 3: Frontend Configuration

1. **Update Environment Variables**
   ```bash
   # Get API Gateway URL
   API_URL=$(serverless info --stage dev | grep "endpoint:" | head -1 | cut -d' ' -f2)
   
   # Update frontend environment
   echo "REACT_APP_API_BASE_URL=$API_URL" > frontend/.env.production
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

### Step 4: Frontend Deployment

#### Option A: S3 Static Website Hosting

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-analytics-frontend-bucket --region us-east-1
   ```

2. **Configure Static Website Hosting**
   ```bash
   aws s3 website s3://your-analytics-frontend-bucket \
     --index-document index.html \
     --error-document index.html
   ```

3. **Upload Frontend Files**
   ```bash
   aws s3 sync frontend/build/ s3://your-analytics-frontend-bucket --delete
   ```

4. **Set Bucket Policy**
   ```bash
   aws s3api put-bucket-policy --bucket your-analytics-frontend-bucket --policy '{
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-analytics-frontend-bucket/*"
       }
     ]
   }'
   ```

#### Option B: Netlify/Vercel

1. **Connect Repository**
   - Connect your GitHub repository to Netlify or Vercel
   - Set build command: `cd frontend && npm run build`
   - Set publish directory: `frontend/build`

2. **Environment Variables**
   - Add `REACT_APP_API_BASE_URL` with your API Gateway URL

#### Option C: GitHub Pages

1. **Install gh-pages**
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Add Deploy Script**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## Production Deployment

### 1. Environment Variables

Create production environment variables:

```bash
# Backend
export STAGE=prod
export REGION=us-east-1

# Frontend
export REACT_APP_API_BASE_URL=https://your-prod-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod
```

### 2. Deploy Backend

```bash
serverless deploy --stage prod --region us-east-1
```

### 3. Deploy Frontend

```bash
cd frontend
npm run build
# Deploy to your production hosting service
```

## Automated Deployment with GitHub Actions

### 1. Set Repository Secrets

In your GitHub repository, add these secrets:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### 2. Configure Workflow

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

- Runs tests
- Builds frontend
- Deploys backend
- Updates environment variables

### 3. Trigger Deployment

Push to the `main` branch to trigger automatic deployment:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

## Monitoring Deployment

### 1. Check Deployment Status

```bash
serverless info --stage prod
```

### 2. View Logs

```bash
# View function logs
serverless logs -f collectEvent --stage prod

# View all logs
serverless logs --stage prod
```

### 3. Monitor Metrics

- **CloudWatch**: View Lambda and DynamoDB metrics
- **API Gateway**: Monitor API usage and errors
- **Cost Explorer**: Track deployment costs

## Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   # Ensure your AWS user has necessary permissions
   aws iam list-attached-user-policies --user-name your-username
   ```

2. **CORS Issues**
   - Verify API Gateway CORS configuration
   - Check frontend environment variables

3. **DynamoDB Errors**
   - Ensure DynamoDB tables are created
   - Check IAM permissions for Lambda functions

4. **Frontend Build Errors**
   ```bash
   # Clear cache and reinstall
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### Debug Commands

```bash
# Test API endpoints
curl -X POST https://your-api-gateway-url/api/events \
  -H "Content-Type: application/json" \
  -d '{"siteId":"test","eventType":"pageview","page":"/test"}'

# Check DynamoDB tables
aws dynamodb list-tables

# View CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/serverless-web-analytics"
```

## Cost Optimization

### 1. Monitor Costs

```bash
# Check current costs
aws ce get-cost-and-usage \
  --time-period Start=2023-01-01,End=2023-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

### 2. Optimize Resources

- Use DynamoDB On-Demand billing
- Set appropriate Lambda memory allocation
- Implement TTL for data cleanup
- Use API Gateway caching

### 3. Set Billing Alerts

```bash
# Create billing alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "Analytics-Monthly-Cost" \
  --alarm-description "Alert when monthly cost exceeds $50" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold
```

## Security Considerations

### 1. IAM Permissions

Ensure minimal required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/serverless-web-analytics-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### 2. API Security

- Enable API Gateway throttling
- Implement rate limiting
- Use HTTPS only
- Validate all inputs

### 3. Data Protection

- Enable DynamoDB encryption
- Use TTL for data retention
- Implement proper access controls
- Monitor for unusual activity

## Rollback Procedures

### 1. Backend Rollback

```bash
# Deploy previous version
serverless deploy --stage prod --region us-east-1

# Or remove deployment
serverless remove --stage prod
```

### 2. Frontend Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or manually deploy previous build
```

## Maintenance

### 1. Regular Updates

- Update dependencies monthly
- Monitor security advisories
- Review and optimize costs
- Update documentation

### 2. Backup Procedures

- DynamoDB: Enable point-in-time recovery
- Code: Use Git for version control
- Configuration: Store in version control

### 3. Health Checks

```bash
# Create health check script
curl -f https://your-api-gateway-url/api/health || exit 1
```

This deployment guide ensures a smooth and secure deployment of your serverless analytics dashboard.
