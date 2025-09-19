const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const SITES_TABLE = process.env.SITES_TABLE;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { name, domain, description, ownerEmail } = body;

    if (!name || !domain) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          error: 'name and domain are required'
        })
      };
    }

    const siteId = uuidv4();
    const siteData = {
      siteId,
      name,
      domain,
      description: description || '',
      ownerEmail: ownerEmail || '',
      createdAt: new Date().toISOString(),
      isActive: true
    };

    await dynamodb.put({
      TableName: SITES_TABLE,
      Item: siteData
    }).promise();

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        site: siteData
      })
    };

  } catch (error) {
    console.error('Error registering site:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};