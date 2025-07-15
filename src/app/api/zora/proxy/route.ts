import { NextRequest, NextResponse } from 'next/server';

/**
 * POST - Proxy GraphQL requests to Zora API
 * This fixes CORS issues by proxying requests through the backend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, variables } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'GraphQL query is required' },
        { status: 400 }
      );
    }

    // Make the request to Zora's GraphQL API
    const response = await fetch('https://api.zora.co/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GigaVibe/1.0',
        // Add API key if available
        ...(process.env.NEXT_PUBLIC_ZORA_API_KEY && {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ZORA_API_KEY}`
        })
      },
      body: JSON.stringify({
        query,
        variables: variables || {}
      })
    });

    if (!response.ok) {
      console.error('Zora API error:', response.status, response.statusText);
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