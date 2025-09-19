exports.handler = async (event) => {
  console.log('Analytics script request:', JSON.stringify(event, null, 2));

  try {
    const { siteId } = event.queryStringParameters || {};

    if (!siteId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'text/javascript',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: 'console.error("Analytics: siteId is required");'
      };
    }

    // Generate the tracking script
    const script = generateTrackingScript(siteId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/javascript',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: 'console.error("Analytics: Failed to load tracking script");'
    };
  }
};

function generateTrackingScript(siteId) {
  const apiBaseUrl = process.env.API_GATEWAY_URL || 'https://ta2um19ls0.execute-api.us-east-1.amazonaws.com/dev';
  
  return `
(function() {
  'use strict';
  
  // Configuration
  var config = {
    siteId: '${siteId}',
    apiUrl: '${apiBaseUrl}/api/events',
    debug: false,
    respectDoNotTrack: true
  };
  
  // Check if Do Not Track is enabled
  if (config.respectDoNotTrack && navigator.doNotTrack === '1') {
    return;
  }
  
  // Generate session ID
  var sessionId = getSessionId();
  
  // Track page view
  function trackPageView() {
    var data = {
      siteId: config.siteId,
      eventType: 'pageview',
      page: window.location.pathname + window.location.search,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: sessionId
    };
    
    sendEvent(data);
  }
  
  // Send event to server
  function sendEvent(data) {
    if (config.debug) {
      console.log('Analytics Event:', data);
    }
    
    // Use sendBeacon if available, otherwise fallback to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon(config.apiUrl, JSON.stringify(data));
    } else {
      fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(function(error) {
        if (config.debug) {
          console.error('Analytics Error:', error);
        }
      });
    }
  }
  
  // Generate or retrieve session ID
  function getSessionId() {
    var sessionKey = 'analytics_session_' + config.siteId;
    var sessionId = sessionStorage.getItem(sessionKey);
    
    if (!sessionId) {
      sessionId = generateId();
      sessionStorage.setItem(sessionKey, sessionId);
    }
    
    return sessionId;
  }
  
  // Generate unique ID
  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // Initialize tracking
  function init() {
    // Track initial page view
    trackPageView();
    
    // Track page exit
    window.addEventListener('beforeunload', function() {
      trackPageView();
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
`;
}
