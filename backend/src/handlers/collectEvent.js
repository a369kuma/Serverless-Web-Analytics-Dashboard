const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE;

exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const {
      siteId,
      eventType = 'pageview',
      page,
      referrer,
      userAgent,
      ip,
      timestamp = new Date().toISOString()
    } = body;

    // Validate required fields
    if (!siteId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          error: 'siteId is required'
        })
      };
    }

    // Generate unique event ID
    const eventId = uuidv4();
    
    // Calculate TTL (30 days from now)
    const ttl = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

    const eventData = {
      siteId,
      timestamp,
      eventId,
      eventType,
      page: page || '/',
      referrer: referrer || null,
      userAgent: userAgent || null,
      ip: ip || null,
      ttl
    };

    // Store event in DynamoDB
    await dynamodb.put({
      TableName: ANALYTICS_TABLE,
      Item: eventData
    }).promise();

    console.log('Event stored successfully:', eventId);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        eventId,
        message: 'Event collected successfully'
      })
    };

  } catch (error) {
    console.error('Error collecting event:', error);
    
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
