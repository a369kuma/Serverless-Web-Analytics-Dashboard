exports.handler = async (event) => {
  try {
    const { siteId } = event.queryStringParameters || {};

    if (!siteId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'text/javascript',
          'Access-Control-Allow-Origin': '*'
        },
        body: 'console.error("Analytics: siteId is required");'
      };
    }

    const script = `
(function() {
  'use strict';
  
  var config = {
    siteId: '${siteId}',
    apiUrl: '${process.env.API_GATEWAY_URL || 'https://ta2um19ls0.execute-api.us-east-1.amazonaws.com/dev'}/api/events'
  };
  
  function trackPageView() {
    var data = {
      siteId: config.siteId,
      eventType: 'pageview',
      page: window.location.pathname + window.location.search,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).catch(function(error) {
      console.error('Analytics Error:', error);
    });
  }
  
  // Track initial page view
  trackPageView();
  
  // Track page exit
  window.addEventListener('beforeunload', function() {
    trackPageView();
  });
  
})();
`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/javascript',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      },
      body: script
    };

  } catch (error) {
    console.error('Error generating analytics script:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/javascript',
        'Access-Control-Allow-Origin': '*'
      },
      body: 'console.error("Analytics: Failed to load tracking script");'
    };
  }
};