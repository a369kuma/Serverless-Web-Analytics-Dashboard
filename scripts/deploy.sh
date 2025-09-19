#!/bin/bash

# Serverless Web Analytics Deployment Script
# This script handles the complete deployment of the analytics system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STAGE=${1:-dev}
REGION=${2:-us-east-1}
FRONTEND_BUILD_DIR="frontend/build"

echo -e "${BLUE}🚀 Starting deployment of Serverless Web Analytics${NC}"
echo -e "${BLUE}Stage: ${STAGE}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Serverless Framework is installed
if ! command -v serverless &> /dev/null; then
    echo -e "${RED}❌ Serverless Framework is not installed. Please install it first.${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}🔍 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ AWS credentials configured${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Build frontend
echo -e "${YELLOW}🏗️  Building frontend...${NC}"
cd frontend
npm install
npm run build
cd ..

# Deploy backend
echo -e "${YELLOW}🚀 Deploying backend services...${NC}"
serverless deploy --stage $STAGE --region $REGION

# Get API Gateway URL
echo -e "${YELLOW}🔗 Getting API Gateway URL...${NC}"
API_URL=$(serverless info --stage $STAGE --region $REGION | grep "endpoint:" | head -1 | cut -d' ' -f2)

if [ -z "$API_URL" ]; then
    echo -e "${RED}❌ Failed to get API Gateway URL${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API Gateway URL: ${API_URL}${NC}"

# Update frontend environment
echo -e "${YELLOW}⚙️  Updating frontend environment...${NC}"
echo "REACT_APP_API_BASE_URL=$API_URL" > frontend/.env.production

# Deploy frontend to S3 (if configured)
if [ "$STAGE" = "prod" ]; then
    echo -e "${YELLOW}🌐 Deploying frontend to S3...${NC}"
    
    # Check if S3 bucket exists
    BUCKET_NAME="serverless-analytics-frontend-${STAGE}"
    
    if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
        echo -e "${YELLOW}📦 Creating S3 bucket...${NC}"
        aws s3 mb "s3://$BUCKET_NAME" --region $REGION
        
        # Configure bucket for static website hosting
        aws s3 website "s3://$BUCKET_NAME" --index-document index.html --error-document index.html
    fi
    
    # Upload frontend files
    aws s3 sync $FRONTEND_BUILD_DIR "s3://$BUCKET_NAME" --delete
    
    # Set proper permissions
    aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
            }
        ]
    }'
    
    FRONTEND_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
    echo -e "${GREEN}✅ Frontend deployed to: ${FRONTEND_URL}${NC}"
else
    echo -e "${YELLOW}ℹ️  Frontend built locally. For production deployment, configure S3 hosting.${NC}"
fi

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
cd frontend
npm test -- --coverage --watchAll=false
cd ..

# Display deployment summary
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "  Stage: ${STAGE}"
echo -e "  Region: ${REGION}"
echo -e "  API URL: ${API_URL}"
if [ "$STAGE" = "prod" ] && [ ! -z "$FRONTEND_URL" ]; then
    echo -e "  Frontend URL: ${FRONTEND_URL}"
fi

echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "  1. Update your frontend environment with the API URL"
echo -e "  2. Test the API endpoints"
echo -e "  3. Add your first site to start tracking analytics"
echo -e "  4. Monitor the CloudWatch logs for any issues"

echo -e "${GREEN}✨ Happy tracking!${NC}"
