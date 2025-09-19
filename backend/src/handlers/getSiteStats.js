const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE;

exports.handler = async (event) => {
  console.log('Get site stats request:', JSON.stringify(event, null, 2));

  try {
    const { siteId } = event.pathParameters;
    const {
      period = '7d',
      metric = 'pageviews'
    } = event.queryStringParameters || {};

    if (!siteId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({
          error: 'siteId is required'
        })
      };
    }

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    const params = {
      TableName: ANALYTICS_TABLE,
      KeyConditionExpression: 'siteId = :siteId AND #timestamp BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#timestamp': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':siteId': siteId,
        ':startDate': startDate.toISOString(),
        ':endDate': endDate.toISOString()
      }
    };

    const result = await dynamodb.query(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        siteId,
        period,
        metric,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        stats: {
          totalEvents: result.Count,
          events: result.Items
        }
      })
    };

  } catch (error) {
    console.error('Error getting site stats:', error);
    
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
