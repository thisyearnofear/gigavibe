import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientData = requestCounts.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (clientData.count >= RATE_LIMIT) {
    return false;
  }
  
  clientData.count++;
  return true;
}

/**
 * POST - Proxy GraphQL requests to Zora API
 * This fixes CORS issues by proxying requests through the backend
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting based on IP
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { query, variables } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'GraphQL query is required' },
        { status: 400 }
      );
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      // Make the request to Zora's GraphQL API
      const response = await fetch('https://api.zora.co/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GigaVibe/1.0',
          // Add API key if available (server-side only)
          ...(process.env.ZORA_API_KEY && {
            'Authorization': `Bearer ${process.env.ZORA_API_KEY}`
          })
        },
        body: JSON.stringify({
          query,
          variables: variables || {}
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('Zora API error:', response.status, response.statusText);
        
        // Handle specific error codes
        if (response.status === 429) {
          return NextResponse.json(
            { error: 'Zora API rate limit exceeded. Please try again later.' },
            { status: 429 }
          );
        }
        
        if (response.status >= 500) {
          return NextResponse.json(
            { error: 'Zora API is temporarily unavailable. Please try again later.' },
            { status: 503 }
          );
        }
        
        return NextResponse.json(
          { error: `Zora API error: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      // Check for GraphQL errors
      if (data.errors) {
        console.error('Zora GraphQL errors:', data.errors);
        return NextResponse.json(
          { error: 'GraphQL query failed', details: data.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout. Zora API is taking too long to respond.' },
          { status: 504 }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Zora proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Zora API' },
      { status: 500 }
    );
  }
}

/**
 * GET - Health check for Zora proxy
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Zora API Proxy',
    timestamp: new Date().toISOString()
  });
}