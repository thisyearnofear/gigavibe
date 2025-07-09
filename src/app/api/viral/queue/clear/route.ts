import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/DatabaseService';

/**
 * API route to clear viral queue
 * POST /api/viral/queue/clear
 */
export async function POST(request: NextRequest) {
  try {
    // Clear the queue in the database
    await databaseService.clearViralQueue();
    
    return NextResponse.json({
      success: true,
      message: 'Viral queue cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing viral queue:', error);
    return NextResponse.json(
      { error: 'Failed to clear viral queue' },
      { status: 500 }
    );
  }
}