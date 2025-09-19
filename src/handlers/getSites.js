const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const SITES_TABLE = process.env.SITES_TABLE;

exports.handler = async (event) => {
  try {
    const params = {
      TableName: SITES_TABLE
    };

    const result = await dynamodb.scan(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        sites: result.Items || []
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