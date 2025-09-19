const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const SITES_TABLE = process.env.SITES_TABLE;

exports.handler = async (event) => {
  console.log('Register site request:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const {
      name,
      domain,
      description,
      ownerEmail
    } = body;

    // Validate required fields
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

    // Generate site ID
    const siteId = uuidv4();
    const trackingCode = generateTrackingCode(siteId);

    const siteData = {
      siteId,
      name,
      domain,
      description: description || '',
      ownerEmail: ownerEmail || '',
      trackingCode,
      createdAt: new Date().toISOString(),
      isActive: true,
      settings: {
        trackPageviews: true,
        trackEvents: true,
        trackReferrers: true,
        trackUserAgents: true,
        trackIPs: false,
        dataRetentionDays: 30
      }
    };

    // Store site in DynamoDB
    await dynamodb.put({
      TableName: SITES_TABLE,
      Item: siteData
    }).promise();

    console.log('Site registered successfully:', siteId);

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        site: siteData,
        message: 'Site registered successfully'
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

function generateTrackingCode(siteId) {
  return `
<!-- Serverless Web Analytics -->
<script>
(function() {
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://ta2um19ls0.execute-api.us-east-1.amazonaws.com/dev/api/analytics.js?siteId=${siteId}';
  document.head.appendChild(script);
})();
</script>
<noscript>
  <img src="https://ta2um19ls0.execute-api.us-east-1.amazonaws.com/dev/api/events?siteId=${siteId}&eventType=pageview" style="display:none;" />
</noscript>
<!-- End Serverless Web Analytics -->`;
}
