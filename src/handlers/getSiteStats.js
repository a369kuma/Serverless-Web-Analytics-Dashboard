const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE;

exports.handler = async (event) => {
  try {
    const { siteId } = event.pathParameters;

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

    const params = {
      TableName: ANALYTICS_TABLE,
      KeyConditionExpression: 'siteId = :siteId',
      ExpressionAttributeValues: {
        ':siteId': siteId
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
        success: true,
        siteId,
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