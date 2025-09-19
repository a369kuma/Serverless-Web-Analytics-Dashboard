# EchoDash

A comprehensive, serverless web analytics solution built with AWS Lambda, DynamoDB, and React. This project demonstrates event-driven architecture, cost optimization, and Infrastructure as Code (IaC) for serverless applications.

## 🚀 Features

### Core Analytics
- **Real-time Event Collection**: Track pageviews, custom events, and user interactions
- **Comprehensive Dashboard**: Beautiful React-based analytics dashboard with interactive charts
- **Multi-site Support**: Track multiple websites from a single dashboard
- **Privacy-Focused**: Respects Do Not Track, filters bots, and provides data retention controls

### Technical Features
- **Serverless Architecture**: Built entirely on AWS Lambda and API Gateway
- **Event-Driven Design**: Asynchronous event processing for scalability
- **Cost Optimization**: Built-in rate limiting, TTL-based data cleanup, and cost monitoring
- **Infrastructure as Code**: Complete deployment automation with Serverless Framework
- **Real-time Tracking**: JavaScript tracking script with advanced features

### Analytics Insights
- **Pageview Tracking**: Monitor page visits and user journeys
- **Visitor Analytics**: Unique visitors, session tracking, and user behavior
- **Device & Browser Stats**: Comprehensive device and browser analytics
- **Referrer Tracking**: Monitor traffic sources and external links
- **Geographic Data**: Country and city-level analytics (when available)
- **Scroll Depth**: Track user engagement with scroll depth analytics

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Website       │    │   API Gateway    │    │   Lambda        │
│   (Tracking)    │───▶│   (REST API)     │───▶│   Functions     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                       ┌──────────────────┐            │
                       │   DynamoDB       │◀───────────┘
                       │   (Data Store)   │
                       └──────────────────┘
                                │
                       ┌──────────────────┐
                       │   React          │
                       │   Dashboard      │
                       └──────────────────┘
```

### Components

1. **Frontend Dashboard** (React + Tailwind CSS)
   - Site management interface
   - Real-time analytics visualization
   - Interactive charts with Recharts
   - Responsive design

2. **Backend API** (AWS Lambda + API Gateway)
   - Event collection endpoints
   - Analytics data retrieval
   - Site management
   - Rate limiting and security

3. **Data Storage** (DynamoDB)
   - Analytics events with TTL
   - Site configuration data
   - Optimized for serverless access patterns

4. **Tracking Script** (JavaScript)
   - Lightweight client-side tracking
   - Bot detection and filtering
   - Privacy compliance features
   - Advanced event tracking

## 🛠️ Technology Stack

### Backend
- **AWS Lambda**: Serverless compute for API endpoints
- **API Gateway**: RESTful API management
- **DynamoDB**: NoSQL database with TTL support
- **Serverless Framework**: Infrastructure as Code
- **Node.js**: Runtime environment

### Frontend
- **React 18**: Modern UI framework
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Data visualization library
- **React Router**: Client-side routing
- **Axios**: HTTP client

### DevOps & Deployment
- **GitHub Actions**: CI/CD pipeline
- **AWS CLI**: Cloud resource management
- **Webpack**: Module bundling
- **Babel**: JavaScript transpilation

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with appropriate permissions
- Serverless Framework CLI
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd serverless-web-analytics
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region
```

### 4. Deploy the Application

```bash
# Deploy to development environment
npm run deploy:dev

# Or use the deployment script
./scripts/deploy.sh dev
```

### 5. Configure Frontend Environment

After deployment, update the frontend environment:

```bash
# Get the API Gateway URL from deployment output
API_URL=$(serverless info --stage dev | grep "endpoint:" | head -1 | cut -d' ' -f2)

# Update frontend environment
echo "REACT_APP_API_BASE_URL=$API_URL" > frontend/.env.production
```

### 6. Build and Deploy Frontend

```bash
cd frontend
npm run build
# Deploy the build folder to your preferred hosting service
```

## 🚀 Usage

### 1. Add Your First Site

1. Navigate to your deployed dashboard
2. Click "Add New Site"
3. Fill in your website details:
   - Site Name
   - Domain
   - Description (optional)
   - Owner Email (optional)

### 2. Install Tracking Code

Copy the provided tracking code and add it to your website's HTML, preferably in the `<head>` section:

```html
<!-- Serverless Web Analytics -->
<script>
(function() {
  var script = document.createElement('script');
  script.async = true;
  script.src = 'YOUR_API_GATEWAY_URL/api/analytics.js';
  script.setAttribute('data-site-id', 'YOUR_SITE_ID');
  document.head.appendChild(script);
})();
</script>
<!-- End Serverless Web Analytics -->
```

### 3. View Analytics

- Visit your website to generate test data
- Return to the dashboard to view real-time analytics
- Explore different time ranges and metrics
- Monitor visitor behavior and engagement

## 📊 API Endpoints

### Event Collection
- `POST /api/events` - Collect analytics events
- `GET /api/analytics.js` - Serve tracking script

### Analytics Data
- `GET /api/analytics` - Get analytics data for a site
- `GET /api/sites/{siteId}/stats` - Get detailed site statistics

### Site Management
- `POST /api/sites` - Register a new site
- `GET /api/sites` - List all sites

## 🔧 Configuration

### Environment Variables

#### Backend (Lambda)
- `ANALYTICS_TABLE`: DynamoDB table for analytics data
- `SITES_TABLE`: DynamoDB table for site configuration
- `API_GATEWAY_URL`: Base URL for API Gateway

#### Frontend (React)
- `REACT_APP_API_BASE_URL`: Backend API URL

### Rate Limiting

The system includes built-in rate limiting:
- **Per IP**: 1000 requests per 15 minutes
- **Per Site**: 10,000 requests per minute

### Data Retention

- Analytics data automatically expires after 30 days (configurable)
- TTL is set on DynamoDB items for automatic cleanup
- Cost optimization through automatic data lifecycle management

## 💰 Cost Optimization

### Built-in Optimizations

1. **DynamoDB On-Demand Billing**: Pay only for what you use
2. **TTL-based Cleanup**: Automatic data expiration
3. **Rate Limiting**: Prevent abuse and excessive costs
4. **Lambda Optimization**: Efficient memory allocation and cold start handling
5. **API Gateway Caching**: Reduce backend load for frequently requested data

### Estimated Monthly Costs

- **DynamoDB**: $5-20 (depending on usage)
- **Lambda**: $1-10 (depending on requests)
- **API Gateway**: $1-5 (depending on requests)
- **Total**: $7-35 per month for typical usage

### Cost Monitoring

Use the built-in cost optimization endpoint to monitor and optimize costs:

```bash
curl https://your-api-gateway-url/api/cost-optimization
```

## 🔒 Security Features

- **Rate Limiting**: Prevent abuse and DDoS attacks
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Sanitize and validate all inputs
- **Bot Detection**: Filter out crawlers and bots
- **Privacy Compliance**: Respect Do Not Track headers

## 🧪 Testing

### Backend Tests

```bash
# Run backend tests
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
# Test API endpoints
curl -X POST https://your-api-gateway-url/api/events \
  -H "Content-Type: application/json" \
  -d '{"siteId":"test-site","eventType":"pageview","page":"/test"}'
```

## 📈 Monitoring & Logging

### CloudWatch Integration

- Lambda function logs
- DynamoDB metrics
- API Gateway logs
- Custom metrics for analytics

### Health Checks

Monitor your deployment health:

```bash
# Check deployment status
serverless info --stage prod

# View logs
serverless logs -f collectEvent --stage prod
```

## 🚀 Deployment

### Development

```bash
npm run deploy:dev
```

### Production

```bash
npm run deploy:prod
```

### Automated Deployment

The project includes GitHub Actions for automated deployment:

1. Push to `main` branch
2. GitHub Actions automatically:
   - Runs tests
   - Builds frontend
   - Deploys backend
   - Updates environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

1. **CORS Errors**: Ensure API Gateway CORS is properly configured
2. **DynamoDB Permissions**: Check IAM roles and policies
3. **Lambda Timeouts**: Optimize function performance or increase timeout
4. **Rate Limiting**: Adjust rate limits in configuration

### Getting Help

- Check the GitHub Issues for common problems
- Review AWS CloudWatch logs for debugging
- Ensure all environment variables are properly set

## 🎯 Learning Outcomes

This project demonstrates:

- **Event-Driven Architecture**: Asynchronous event processing
- **Serverless Best Practices**: Cost optimization and performance
- **Infrastructure as Code**: Automated deployment and management
- **Real-time Analytics**: Data collection and visualization
- **Security**: Rate limiting, input validation, and privacy compliance
- **Monitoring**: CloudWatch integration and health checks

## 🔮 Future Enhancements

- Real-time dashboard updates with WebSockets
- Advanced user segmentation and cohort analysis
- A/B testing framework integration
- Machine learning for anomaly detection
- Multi-region deployment for global performance
- Advanced privacy controls and GDPR compliance

---

Built with ❤️ using AWS Serverless technologies
