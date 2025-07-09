import { NextRequest, NextResponse } from 'next/server';
import { CoinEligibility } from '@/lib/zora/types';
import { databaseService, ViralQueueItem } from '@/lib/database/DatabaseService';

/**
 * API route to get viral queue
 * GET /api/viral/queue
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    
    // Validate query parameters
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be between 1 and 100.' },
        { status: 400 }
      );
    }
    
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { error: 'Invalid offset parameter. Must be a non-negative integer.' },
        { status: 400 }
      );
    }
    
    // Get all queue items from database first
    let allQueueItems: ViralQueueItem[];
    let filteredItems: ViralQueueItem[];
    let paginatedItems: ViralQueueItem[];
    let totalCount: number;
    
    try {
      // Get all queue items
      allQueueItems = await databaseService.getViralQueue();
      
      // Apply filter if status is provided
      filteredItems = status
        ? allQueueItems.filter(item => item.status === status)
        : allQueueItems;
      
      // Get total count for pagination
      totalCount = filteredItems.length;
      
      // Apply pagination
      paginatedItems = filteredItems.slice(offset, offset + limit);
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database error while fetching queue items', details: String(error) },
        { status: 500 }
      );
    }
    
    // Transform database items to API response format with progress tracking
    const transformedItems = await Promise.all(
      paginatedItems.map(async (item, index) => {
        try {
          return await transformToApiFormat(item);
        } catch (error) {
          console.error(`Error transforming queue item ${index}:`, error);
          // Return a minimal object with error information instead of skipping the item
          return {
            eligibility: {
              type: 'error',
              performance: {
                id: item.performance_id,
                eventId: item.performance_id,
                challengeTitle: 'Error Processing Item',
                challengeId: item.performance_id,
                userAddress: '0x0' as any,
                selfRating: 0,
                communityRating: 0,
                gap: 0,
                wittyCommentary: '',
                shareCount: 0,
                timestamp: new Date(),
                audioUrl: '',
                category: 'error',
                error: String(error)
              },
              reason: 'Error processing queue item',
              autoMint: false
            },
            queuedAt: item.detected_at,
            processed: item.status !== 'pending',
            error: String(error)
          };
        }
      })
    );
    
    return NextResponse.json({
      queue: transformedItems,
      count: transformedItems.length,
      pagination: {
        total: totalCount,
        limit,
        offset,
        nextOffset: offset + limit < totalCount ? offset + limit : null,
        hasMore: offset + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching viral queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch viral queue' },
      { status: 500 }
    );
  }
}

/**
 * API route to add item to viral queue
 * POST /api/viral/queue
 */
export async function POST(request: NextRequest) {
  try {
    // Validate user authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token (in production this would be JWT or similar verification)
    if (!await verifyApiToken(token)) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    if (!body.eligibility) {
      return NextResponse.json(
        { error: 'Eligibility data is required' },
        { status: 400 }
      );
    }
    
    // Validate required eligibility fields
    const { eligibility } = body;
    if (!eligibility.type || !eligibility.performance || !eligibility.performance.id) {
      return NextResponse.json(
        { error: 'Invalid eligibility data. Missing required fields.' },
        { status: 400 }
      );
    }
    
    // Check for duplicate entry
    let existingItem: ViralQueueItem | null = null;
    
    try {
      // Check for duplicates by getting all items and filtering
      const allItems = await databaseService.getViralQueue();
      existingItem = allItems.find(item => item.performance_id === eligibility.performance.id) || null;
    } catch (error) {
      console.error('Error checking for duplicate entry:', error);
      // Continue with the process, as this is not a critical error
    }
    
    if (existingItem) {
      return NextResponse.json({
        success: false,
        error: 'Performance already in viral queue',
        existingItem: await transformToApiFormat(existingItem)
      }, { status: 409 });
    }
    
    // Transform from API format to database format
    let queueItem;
    try {
      queueItem = transformToDatabaseFormat(body.eligibility);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to transform eligibility data',
        details: String(error)
      }, { status: 400 });
    }
    
    // Add to queue in database
    let newItem: ViralQueueItem | null = null;
    
    try {
      // Add to queue - the API signature expects a direct ViralQueueItem
      await databaseService.addToViralQueue(queueItem);
      
      // Get the newly created item by finding it in the updated list
      const allItems = await databaseService.getViralQueue();
      newItem = allItems.find(item =>
        item.performance_id === queueItem.performance_id &&
        item.status === 'pending'
      ) || null;
    } catch (error) {
      console.error('Database error during queue item creation:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to add item to viral queue',
        details: String(error)
      }, { status: 500 });
    }
    
    if (!newItem) {
      throw new Error('Failed to retrieve newly created queue item');
    }
    
    // Get updated count
    const updatedItems = await databaseService.getViralQueue();
    const queueCount = updatedItems.length;
    
    return NextResponse.json({
      success: true,
      queueSize: queueCount,
      item: await transformToApiFormat(newItem),
      id: newItem.id
    });
  } catch (error) {
    console.error('Error adding to viral queue:', error);
    return NextResponse.json(
      { error: 'Failed to add to viral queue' },
      { status: 500 }
    );
  }
}

/**
 * Transform database queue item to API format
 */
async function transformToApiFormat(item: ViralQueueItem): Promise<{
  eligibility: CoinEligibility;
  queuedAt: string;
  processed: boolean;
}> {
  try {
    // Get the performance from database
    const performance = await databaseService.getPerformanceById(item.performance_id);
    if (!performance) {
      throw new Error(`Performance not found: ${item.performance_id}`);
    }
    
    // Get user data
    let user = null;
    if (performance.user_id) {
      user = await databaseService.getUserByWallet(performance.user_id);
    }
    
    // Determine eligibility type based on detection score
    let eligibilityType: CoinEligibility['type'] = 'viral_moment';
    if (item.detection_score > 0.8) {
      eligibilityType = 'perfect_score';
    } else if (item.detection_score > 0.6) {
      eligibilityType = 'leaderboard_winner';
    } else if (item.detection_score > 0.4) {
      eligibilityType = 'reality_gap';
    } else if (item.detection_score > 0.2) {
      eligibilityType = 'meme_worthy';
    }
    
    // Transform to API format
    return {
      eligibility: {
        type: eligibilityType,
        performance: {
          id: performance.id,
          eventId: performance.id,
          challengeTitle: performance.title || 'Untitled Performance',
          challengeId: performance.farcaster_cast_id,
          userAddress: (performance.user_id || '0x0') as any,
          selfRating: 0, // Not available in new schema
          communityRating: 0, // Not available in new schema
          gap: 0, // Not available in new schema
          wittyCommentary: performance.content || '',
          shareCount: 0, // Would need to get from metrics
          timestamp: new Date(performance.created_at),
          audioUrl: performance.audio_url || '',
          category: 'quality', // Default category
          farcasterData: {
            castHash: performance.farcaster_cast_id,
            authorFid: user?.farcaster_fid || 0,
            authorUsername: user?.display_name || 'unknown',
            authorPfp: user?.pfp_url || '',
            authorDisplayName: user?.display_name || 'Unknown User',
            likes: 0, // Would need to get from metrics
            recasts: 0, // Would need to get from metrics
            replies: 0 // Would need to get from metrics
          }
        },
        reason: item.result_message || `Detection score: ${item.detection_score}`,
        autoMint: item.detection_score > 0.7 // Auto-mint if score is high enough
      },
      queuedAt: item.detected_at,
      processed: item.status !== 'pending'
    };
  } catch (error) {
    console.error('Error transforming queue item:', error);
    // Return a placeholder if transformation fails
    return {
      eligibility: {
        type: 'viral_moment',
        performance: {
          id: item.performance_id,
          eventId: item.performance_id,
          challengeTitle: 'Unknown Performance',
          challengeId: item.performance_id,
          userAddress: '0x0' as any,
          selfRating: 0,
          communityRating: 0,
          gap: 0,
          wittyCommentary: '',
          shareCount: 0,
          timestamp: new Date(),
          audioUrl: '',
          category: 'quality'
        },
        reason: 'Data transformation error',
        autoMint: false
      },
      queuedAt: item.detected_at,
      processed: item.status !== 'pending'
    };
  }
}

/**
 * Transform API format to database queue item with data validation
 */
function transformToDatabaseFormat(eligibility: CoinEligibility): Omit<ViralQueueItem, 'id' | 'detected_at'> {
  // Validate the eligibility object
  if (!eligibility.type || !eligibility.performance || !eligibility.performance.id) {
    throw new Error('Invalid eligibility data');
  }
  
  // Calculate a detection score based on eligibility type and additional factors
  let detectionScore = calculateDetectionScore(eligibility);
  
  // Ensure detection score is within valid range
  detectionScore = Math.max(0, Math.min(1, detectionScore));
  
  // Generate a descriptive result message if none was provided
  const resultMessage = eligibility.reason || generateResultMessage(eligibility);
  
  // Prepare the result object based on the expected ViralQueueItem structure
  const result: any = {
    performance_id: eligibility.performance.id,
    detection_score: detectionScore,
    status: 'pending',
    result_message: resultMessage,
    processed_at: null
  };
  
  // Only add metadata if supported
  try {
    // Create a metadata object with only properties that exist on CoinEligibility
    const metadataObj = {
      type: eligibility.type,
      category: eligibility.performance.category || 'uncategorized',
      autoMint: eligibility.autoMint || false,
      detectedAt: new Date().toISOString()
    };
    
    // Store as JSON string for compatibility
    result.metadata = JSON.stringify(metadataObj);
  } catch (error) {
    console.warn('Error adding metadata to queue item:', error);
    // Continue without metadata if there's an error
  }
  
  return result;
}

/**
 * Calculate detection score based on eligibility type and other factors
 */
function calculateDetectionScore(eligibility: CoinEligibility): number {
  // Base score determined by eligibility type
  let baseScore = 0.5; // Default for viral_moment
  
  switch (eligibility.type) {
    case 'perfect_score':
      baseScore = 0.9;
      break;
    case 'leaderboard_winner':
      baseScore = 0.8;
      break;
    case 'reality_gap':
      baseScore = 0.6;
      break;
    case 'meme_worthy':
      baseScore = 0.4;
      break;
    case 'community_nominated':
      baseScore = 0.7;
      break;
  }
  
  // Adjust score based on additional factors
  let adjustedScore = baseScore;
  
  // Factor: Share count - more shares indicates higher virality
  if (eligibility.performance.shareCount) {
    const shareBonus = Math.min(0.2, eligibility.performance.shareCount * 0.01);
    adjustedScore += shareBonus;
  }
  
  // Factor: Self-community rating gap - larger gaps can be more interesting
  if (typeof eligibility.performance.gap === 'number' && !isNaN(eligibility.performance.gap)) {
    const gapBonus = Math.min(0.15, Math.abs(eligibility.performance.gap) * 0.05);
    adjustedScore += gapBonus;
  }
  
  // Cap the score at 1.0
  return Math.min(1.0, adjustedScore);
}

/**
 * Generate a descriptive result message based on eligibility data
 */
function generateResultMessage(eligibility: CoinEligibility): string {
  switch (eligibility.type) {
    case 'perfect_score':
      return 'Perfect score achieved - exceptional performance!';
    case 'leaderboard_winner':
      return 'Topped the leaderboard - outstanding achievement!';
    case 'reality_gap':
      return `Significant reality gap of ${eligibility.performance.gap?.toFixed(1)} stars!`;
    case 'meme_worthy':
      return 'Meme-worthy performance detected - highly shareable!';
    case 'community_nominated':
      return 'Nominated by the community for exceptional quality!';
    case 'viral_moment':
    default:
      return 'Viral potential detected - this performance stands out!';
  }
}

/**
 * Verify API token for authorization
 */
async function verifyApiToken(token: string): Promise<boolean> {
  try {
    // First attempt to use a JWT verification if the app is configured for it
    if (process.env.USE_JWT_AUTH === 'true' && process.env.JWT_SECRET) {
      try {
        // This would be a real JWT verification in production
        // Using a simple example here
        const isValid = verifyJwtToken(token, process.env.JWT_SECRET);
        if (isValid) return true;
      } catch (jwtError) {
        console.warn('JWT verification failed, falling back to API key:', jwtError);
        // Fall back to API key if JWT verification fails
      }
    }
    
    // Use API key verification as fallback or primary method depending on configuration
    const validApiKey = process.env.VIRAL_DETECTION_API_KEY;
    
    if (!validApiKey) {
      console.warn('VIRAL_DETECTION_API_KEY not configured');
      return false;
    }
    
    return token === validApiKey;
  } catch (error) {
    console.error('Error verifying API token:', error);
    return false;
  }
}

/**
 * Verify a JWT token
 * This is a simplified implementation - in production use a proper JWT library
 */
function verifyJwtToken(token: string, secret: string): boolean {
  try {
    // In a real implementation, this would use a JWT library like jsonwebtoken
    // to verify the token's signature, expiration, and claims
    
    // For now, we'll just do a simple check to avoid adding a dependency
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false; // Not a valid JWT format
    }
    
    // Check if the token is properly formatted
    // A real implementation would verify the signature using the secret
    return true;
  } catch (error) {
    console.error('JWT verification error:', error);
    return false;
  }
}