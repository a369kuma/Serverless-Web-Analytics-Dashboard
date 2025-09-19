const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const SITES_TABLE = process.env.SITES_TABLE;

exports.handler = async (event) => {
  console.log('Get sites request:', JSON.stringify(event, null, 2));

  try {
    const {
      ownerEmail,
      limit = 50,
      lastKey
    } = event.queryStringParameters || {};

    let params = {
      TableName: SITES_TABLE,
      Limit: parseInt(limit)
    };

    // Add pagination if lastKey is provided
    if (lastKey) {
      params.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
    }

    // Filter by owner email if provided
    if (ownerEmail) {
      params.FilterExpression = 'ownerEmail = :ownerEmail';
      params.ExpressionAttributeValues = {
        ':ownerEmail': ownerEmail
      };
    }

    const result = await dynamodb.scan(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        sites: result.Items || [],
        count: result.Count,
        lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null
      })
    };

  } catch (error) {
    console.error('Error getting sites:', error);
    
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
