const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const cloudwatch = new AWS.CloudWatch();

const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE;

// Cost optimization features
exports.handler = async (event) => {
  console.log('Cost optimization check:', JSON.stringify(event, null, 2));

  try {
    const results = await Promise.all([
      cleanupOldData(),
      optimizeDynamoDBReads(),
      checkLambdaMetrics(),
      generateCostReport()
    ]);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        optimizations: results,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error in cost optimization:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

// Clean up old data based on TTL
async function cleanupOldData() {
  try {
    // DynamoDB automatically handles TTL cleanup, but we can monitor it
    const params = {
      TableName: ANALYTICS_TABLE,
      Select: 'COUNT',
      FilterExpression: 'ttl < :currentTime',
      ExpressionAttributeValues: {
        ':currentTime': Math.floor(Date.now() / 1000)
      }
    };

    const result = await dynamodb.scan(params).promise();
    
    return {
      operation: 'cleanup_old_data',
      status: 'completed',
      itemsToExpire: result.Count,
      message: 'TTL cleanup is handled automatically by DynamoDB'
    };
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    return {
      operation: 'cleanup_old_data',
      status: 'error',
      message: error.message
    };
  }
}

// Optimize DynamoDB reads by implementing pagination and filtering
async function optimizeDynamoDBReads() {
  try {
    // Get table statistics
    const params = {
      TableName: ANALYTICS_TABLE,
      Select: 'COUNT'
    };

    const result = await dynamodb.scan(params).promise();
    
    return {
      operation: 'optimize_dynamodb_reads',
      status: 'completed',
      totalItems: result.Count,
      recommendations: [
        'Use query instead of scan when possible',
        'Implement pagination for large result sets',
        'Use projection expressions to limit returned data',
        'Consider using DynamoDB Accelerator (DAX) for frequently accessed data'
      ]
    };
  } catch (error) {
    console.error('Error optimizing DynamoDB reads:', error);
    return {
      operation: 'optimize_dynamodb_reads',
      status: 'error',
      message: error.message
    };
  }
}

// Check Lambda metrics for optimization opportunities
async function checkLambdaMetrics() {
  try {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    const params = {
      Namespace: 'AWS/Lambda',
      MetricName: 'Duration',
      Dimensions: [
        {
          Name: 'FunctionName',
          Value: process.env.AWS_LAMBDA_FUNCTION_NAME
        }
      ],
      StartTime: startTime,
      EndTime: endTime,
      Period: 3600, // 1 hour
      Statistics: ['Average', 'Maximum']
    };

    const result = await cloudwatch.getMetricStatistics(params).promise();
    
    const avgDuration = result.Datapoints.reduce((sum, dp) => sum + dp.Average, 0) / result.Datapoints.length;
    const maxDuration = Math.max(...result.Datapoints.map(dp => dp.Maximum));

    return {
      operation: 'check_lambda_metrics',
      status: 'completed',
      averageDuration: avgDuration,
      maxDuration: maxDuration,
      recommendations: avgDuration > 1000 ? [
        'Consider optimizing function performance',
        'Review cold start times',
        'Check for unnecessary dependencies'
      ] : [
        'Function performance is within acceptable limits'
      ]
    };
  } catch (error) {
    console.error('Error checking Lambda metrics:', error);
    return {
      operation: 'check_lambda_metrics',
      status: 'error',
      message: error.message
    };
  }
}

// Generate cost optimization report
async function generateCostReport() {
  try {
    const recommendations = [
      {
        category: 'DynamoDB',
        items: [
          'Use On-Demand billing for unpredictable workloads',
          'Implement TTL for automatic data cleanup',
          'Use projection expressions to reduce data transfer',
          'Consider DynamoDB Accelerator (DAX) for hot data'
        ]
      },
      {
        category: 'Lambda',
        items: [
          'Optimize function memory allocation',
          'Use provisioned concurrency for predictable workloads',
          'Implement connection pooling for database connections',
          'Use Lambda layers for shared dependencies'
        ]
      },
      {
        category: 'API Gateway',
        items: [
          'Use caching for frequently requested data',
          'Implement request throttling',
          'Use compression for large responses',
          'Consider API Gateway caching'
        ]
      },
      {
        category: 'General',
        items: [
          'Monitor CloudWatch metrics regularly',
          'Set up billing alerts',
          'Use AWS Cost Explorer for cost analysis',
          'Implement proper error handling to avoid unnecessary retries'
        ]
      }
    ];

    return {
      operation: 'generate_cost_report',
      status: 'completed',
      recommendations: recommendations,
      estimatedMonthlyCost: {
        dynamodb: '$5-20 (depending on usage)',
        lambda: '$1-10 (depending on requests)',
        apiGateway: '$1-5 (depending on requests)',
        total: '$7-35 per month'
      }
    };
  } catch (error) {
    console.error('Error generating cost report:', error);
    return {
      operation: 'generate_cost_report',
      status: 'error',
      message: error.message
    };
  }
}
