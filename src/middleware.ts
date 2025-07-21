import { NextResponse, NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { v4 as uuidv4 } from 'uuid';

// Configure rate limiters for different endpoints
const apiLimiter = new RateLimiterMemory({
  points: 60, // Number of points
  duration: 60, // Per 60 seconds
});

// Stricter rate limiting for upload endpoints
const uploadLimiter = new RateLimiterMemory({
  points: 10, // Only 10 uploads
  duration: 60, // Per 60 seconds
  blockDuration: 120, // Block for 2 minutes if exceeded
});

// Very strict limiting for authentication attempts
const authLimiter = new RateLimiterMemory({
  points: 5, // Only 5 attempts
  duration: 60, // Per 60 seconds
  blockDuration: 300, // Block for 5 minutes if exceeded
});

// IP-based abuse prevention
const ipLimiter = new RateLimiterMemory({
  keyPrefix: 'ip-global',
  points: 500, // Total requests per IP
  duration: 60, // Per minute
});

// Request paths that should be excluded from middleware processing
const EXCLUDED_PATHS = [
  '/_next',
  '/static',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
];

// Sensitive operations that need stricter validation
const SENSITIVE_OPERATIONS = [
  '/api/auth',
  '/api/upload',
  '/api/zora',
  '/api/farcaster',
];

// Security headers based on best practices
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://*.supabase.co https://*.farcaster.xyz https://*.zora.co https://*.filcdn.io https://api.web3.bio https://ensdata.net; img-src 'self' data: blob: https://*.farcaster.xyz https://*.zora.co https://via.placeholder.com https://i2.seadn.io; media-src 'self' blob: https://*.filcdn.io; style-src 'self' 'unsafe-inline';"
};

// Validate request body against expected schema (basic implementation)
function validateRequestBody(body: any, endpoint: string): boolean {
  // This would be expanded with proper schema validation per endpoint
  if (!body) return false;
  
  // Example validation for upload endpoints
  if (endpoint.includes('/api/upload')) {
    return body.file && (
      body.file.type?.startsWith('audio/') || 
      body.file.mimetype?.startsWith('audio/')
    );
  }
  
  // Example validation for auth endpoints
  if (endpoint.includes('/api/auth')) {
    return !!body.address || !!body.message || !!body.signature;
  }
  
  return true;
}

// Sanitize request parameters
function sanitizeRequest(req: NextRequest): NextRequest {
  // This would be expanded with proper sanitization logic
  // For now, we're just demonstrating the concept
  // Note: In Next.js middleware, we can't actually modify the request body
  // This is a limitation - for full request body modification you'd need
  // to handle this in your API route handlers
  
  return req;
}

// Log request details for monitoring
function logRequest(req: NextRequest, res: NextResponse, requestId: string, startTime: number) {
  const duration = Date.now() - startTime;
  const status = res.status;
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const method = req.method;
  const url = req.url;
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  // In production, this would send to a logging service
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    requestId,
    method,
    url,
    status,
    duration,
    ip,
    userAgent,
  }));
  
  // For high-traffic production, this would be sent to a monitoring system
  // like DataDog, New Relic, etc.
}

export async function middleware(req: NextRequest) {
  // Generate unique request ID for tracing
  const requestId = uuidv4();
  const startTime = Date.now();
  
  // Skip middleware for excluded paths
  const url = new URL(req.url);
  if (EXCLUDED_PATHS.some(path => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Clone the request and response for modifications
  const response = NextResponse.next();
  
  try {
    // Apply security headers to all responses
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Add request ID for tracking
    response.headers.set('X-Request-ID', requestId);
    
    // CORS handling for API routes
    if (url.pathname.startsWith('/api')) {
      response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return response;
      }
      
      // Get client IP for rate limiting
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      
      // Apply global IP-based rate limiting
      try {
        await ipLimiter.consume(ip);
      } catch (error) {
        // IP has exceeded global rate limit
        const rateLimitResponse = NextResponse.json(
          { error: 'Too many requests, please try again later' },
          { status: 429 }
        );
        
        // Add retry-after header
        rateLimitResponse.headers.set('Retry-After', '60');
        
        // Log the rate limit event
        logRequest(req, rateLimitResponse, requestId, startTime);
        
        return rateLimitResponse;
      }
      
      // Apply endpoint-specific rate limiting
      let limiter = apiLimiter;
      
      if (url.pathname.includes('/api/upload')) {
        limiter = uploadLimiter;
      } else if (url.pathname.includes('/api/auth')) {
        limiter = authLimiter;
      }
      
      const rateLimitKey = `${ip}:${url.pathname}`;
      
      try {
        await limiter.consume(rateLimitKey);
      } catch (error) {
        // Rate limit exceeded for specific endpoint
        const rateLimitResponse = NextResponse.json(
          { error: 'Rate limit exceeded for this endpoint' },
          { status: 429 }
        );
        
        // Add retry-after header
        rateLimitResponse.headers.set('Retry-After', '60');
        
        // Log the rate limit event
        logRequest(req, rateLimitResponse, requestId, startTime);
        
        return rateLimitResponse;
      }
      
      // Request validation for sensitive operations
      if (SENSITIVE_OPERATIONS.some(op => url.pathname.includes(op))) {
        // For POST/PUT requests, validate the body
        if (['POST', 'PUT'].includes(req.method)) {
          // Clone the request to read the body
          const clonedReq = req.clone();
          
          try {
            const body = await clonedReq.json();
            
            if (!validateRequestBody(body, url.pathname)) {
              const invalidResponse = NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
              );
              
              // Log the validation failure
              logRequest(req, invalidResponse, requestId, startTime);
              
              return invalidResponse;
            }
          } catch (error) {
            // Error parsing JSON body
            const parseErrorResponse = NextResponse.json(
              { error: 'Invalid JSON in request body' },
              { status: 400 }
            );
            
            // Log the parsing error
            logRequest(req, parseErrorResponse, requestId, startTime);
            
            return parseErrorResponse;
          }
        }
        
        // Sanitize the request
        const sanitizedReq = sanitizeRequest(req);
        
        // Continue with the sanitized request
        // Note: In Next.js middleware, we can't actually modify the request body
        // This is a limitation - for full request body modification you'd need
        // to handle this in your API route handlers
      }
    }
    
    // Log successful requests
    logRequest(req, response, requestId, startTime);
    
    return response;
  } catch (error) {
    // Handle any unexpected errors
    console.error('Middleware error:', error);
    
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    
    // Log the error
    logRequest(req, errorResponse, requestId, startTime);
    
    return errorResponse;
  }
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
    // Apply to authentication routes
    '/auth/:path*',
    // Apply to specific sensitive routes
    '/upload/:path*',
    // Exclude static assets and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
