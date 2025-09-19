const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE;

exports.handler = async (event) => {
  console.log('Get analytics request:', JSON.stringify(event, null, 2));

  try {
    const {
      siteId,
      startDate,
      endDate,
      eventType = 'pageview',
      groupBy = 'day'
    } = event.queryStringParameters || {};

    // Validate required parameters
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

    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Query analytics data
    const params = {
      TableName: ANALYTICS_TABLE,
      KeyConditionExpression: 'siteId = :siteId AND #timestamp BETWEEN :startDate AND :endDate',
      FilterExpression: 'eventType = :eventType',
      ExpressionAttributeNames: {
        '#timestamp': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':siteId': siteId,
        ':startDate': start.toISOString(),
        ':endDate': end.toISOString(),
        ':eventType': eventType
      },
      ScanIndexForward: true
    };

    const result = await dynamodb.query(params).promise();
    
    // Calculate summary statistics
    const summary = calculateSummary(result.Items);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        summary,
        data: result.Items,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        groupBy
      })
    };

  } catch (error) {
    console.error('Error getting analytics:', error);
    
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

function calculateSummary(items) {
  if (items.length === 0) {
    return {
      totalPageviews: 0,
      totalUniqueVisitors: 0,
      averagePageviewsPerDay: 0,
      topPage: null,
      topReferrer: null
    };
  }

  const totalPageviews = items.length;
  const uniqueVisitors = new Set(items.map(item => item.sessionId || item.ip)).size;
  const averagePageviewsPerDay = totalPageviews / 30; // Assuming 30 days

  // Find top page
  const pageCounts = {};
  items.forEach(item => {
    const page = item.page || '/';
    pageCounts[page] = (pageCounts[page] || 0) + 1;
  });
  const topPage = Object.entries(pageCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || null;

  // Find top referrer
  const referrerCounts = {};
  items.forEach(item => {
    if (item.referrer) {
      const referrer = new URL(item.referrer).hostname;
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
    }
  });
  const topReferrer = Object.entries(referrerCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || null;

  return {
    totalPageviews,
    totalUniqueVisitors: uniqueVisitors,
    averagePageviewsPerDay: Math.round(averagePageviewsPerDay * 100) / 100,
    topPage,
    topReferrer
  };
}
