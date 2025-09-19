const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Rate limiting configuration
const RATE_LIMITS = {
  // Per IP address
  IP: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000
  },
  // Per site
  SITE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10000
  }
};

// Rate limiter implementation
class RateLimiter {
  constructor() {
    this.rateLimitTable = process.env.RATE_LIMIT_TABLE || 'rate-limits';
  }

  async checkRateLimit(identifier, type = 'IP') {
    const config = RATE_LIMITS[type];
    if (!config) {
      throw new Error(`Invalid rate limit type: ${type}`);
    }

    const now = Date.now();
    const windowStart = now - config.windowMs;
    const key = `${type}:${identifier}`;

    try {
      // Get current rate limit data
      const result = await dynamodb.get({
        TableName: this.rateLimitTable,
        Key: { id: key }
      }).promise();

      let rateLimitData = result.Item;

      if (!rateLimitData) {
        // First request for this identifier
        rateLimitData = {
          id: key,
          requests: 1,
          windowStart: now,
          ttl: Math.floor((now + config.windowMs) / 1000)
        };
      } else {
        // Check if we're in a new window
        if (now - rateLimitData.windowStart > config.windowMs) {
          // Reset the window
          rateLimitData.requests = 1;
          rateLimitData.windowStart = now;
          rateLimitData.ttl = Math.floor((now + config.windowMs) / 1000);
        } else {
          // Increment request count
          rateLimitData.requests += 1;
        }
      }

      // Check if rate limit exceeded
      if (rateLimitData.requests > config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: rateLimitData.windowStart + config.windowMs,
          retryAfter: Math.ceil((rateLimitData.windowStart + config.windowMs - now) / 1000)
        };
      }

      // Update rate limit data
      await dynamodb.put({
        TableName: this.rateLimitTable,
        Item: rateLimitData
      }).promise();

      return {
        allowed: true,
        remaining: config.maxRequests - rateLimitData.requests,
        resetTime: rateLimitData.windowStart + config.windowMs
      };

    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open - allow request if rate limiter fails
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs
      };
    }
  }

  async checkMultipleLimits(identifiers) {
    const results = {};
    
    for (const [type, identifier] of Object.entries(identifiers)) {
      results[type] = await this.checkRateLimit(identifier, type);
    }

    // If any rate limit is exceeded, deny the request
    const allowed = Object.values(results).every(result => result.allowed);
    
    return {
      allowed,
      limits: results
    };
  }
}

// Middleware function for Lambda handlers
function withRateLimit(handler, options = {}) {
  return async (event, context) => {
    const rateLimiter = new RateLimiter();
    
    try {
      // Extract identifiers from the request
      const ip = event.requestContext?.identity?.sourceIp || 'unknown';
      const siteId = event.queryStringParameters?.siteId || event.body?.siteId;
      
      const identifiers = { IP: ip };
      if (siteId) {
        identifiers.SITE = siteId;
      }

      // Check rate limits
      const rateLimitResult = await rateLimiter.checkMultipleLimits(identifiers);

      if (!rateLimitResult.allowed) {
        const exceededLimit = Object.entries(rateLimitResult.limits)
          .find(([, result]) => !result.allowed);

        return {
          statusCode: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'X-RateLimit-Limit': RATE_LIMITS[exceededLimit[0]].maxRequests,
            'X-RateLimit-Remaining': exceededLimit[1].remaining,
            'X-RateLimit-Reset': new Date(exceededLimit[1].resetTime).toISOString(),
            'Retry-After': exceededLimit[1].retryAfter
          },
          body: JSON.stringify({
            error: 'Rate limit exceeded',
            message: `Too many requests. Try again in ${exceededLimit[1].retryAfter} seconds.`,
            retryAfter: exceededLimit[1].retryAfter
          })
        };
      }

      // Add rate limit headers to successful responses
      const response = await handler(event, context);
      
      if (response.headers) {
        const ipLimit = rateLimitResult.limits.IP;
        response.headers['X-RateLimit-Limit'] = RATE_LIMITS.IP.maxRequests;
        response.headers['X-RateLimit-Remaining'] = ipLimit.remaining;
        response.headers['X-RateLimit-Reset'] = new Date(ipLimit.resetTime).toISOString();
      }

      return response;

    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // If rate limiting fails, proceed with the original handler
      return handler(event, context);
    }
  };
}

module.exports = {
  RateLimiter,
  withRateLimit,
  RATE_LIMITS
};
