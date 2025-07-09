import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/DatabaseService';
import { supabase } from '@/integrations/supabase/client';

/**
 * API route to track analytics events
 * POST /api/analytics/track
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.type) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }
    
    // Track event using database service
    await databaseService.trackEvent({
      event_type: body.type,
      user_id: body.userId || null,
      performance_id: body.performanceId || null,
      event_data: body.data || {},
      client_timestamp: body.timestamp || null
    });
    
    // Log event for development
    console.log(`📊 Analytics event tracked: ${body.type}`);
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics event' },
      { status: 500 }
    );
  }
}

/**
 * API route to get analytics events (for admin/debugging)
 * GET /api/analytics/track
 */
export async function GET(request: NextRequest) {
  try {
    // Get type filter if provided
    const searchParams = request.nextUrl.searchParams;
    const typeFilter = searchParams.get('type');
    
    // Create admin client with service role key
    // This client bypasses RLS policies for admin operations
    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          persistSession: false
        }
      }
    );
    
    // Query to get analytics events using admin privileges
    const { data: events, error } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      .order('server_timestamp', { ascending: false })
      .limit(100);
      
    if (error) {
      console.error('Analytics query error:', error);
      // For development purposes, we'll return a descriptive error
      if (error.message.includes('permission denied')) {
        return NextResponse.json({
          error: 'Permission denied: This endpoint requires admin privileges',
          hint: 'Check RLS policies or use the service role key'
        }, { status: 403 });
      }
      throw error;
    }
    
    // Filter by type if specified
    const filteredEvents = typeFilter 
      ? events.filter(event => event.event_type === typeFilter)
      : events;
    
    return NextResponse.json({
      events: filteredEvents,
      count: filteredEvents.length
    });
  } catch (error) {
    console.error('Error fetching analytics events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics events' },
      { status: 500 }
    );
  }
}