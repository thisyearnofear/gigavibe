import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { performanceId, rating } = body;
    
    // Validate request data
    if (!performanceId) {
      return NextResponse.json(
        { error: 'Missing required field: performanceId' },
        { status: 400 }
      );
    }
    
    if (rating === undefined || rating === null) {
      return NextResponse.json(
        { error: 'Missing required field: rating' },
        { status: 400 }
      );
    }
    
    if (typeof rating !== 'number' || rating < 0 || rating > 10) {
      return NextResponse.json(
        { error: 'Invalid rating: must be a number between 0 and 10' },
        { status: 400 }
      );
    }
    
    // In a real implementation, you would:
    // 1. Store the rating in a database
    // 2. Update the performance's average rating
    // 3. Log the rating activity for analytics
    
    console.log(`Performance ${performanceId} rated: ${rating}`);
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('Error in rate API:', error);
    return NextResponse.json(
      { error: 'Failed to process rating' },
      { status: 500 }
    );
  }
}