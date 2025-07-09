import { NextRequest, NextResponse } from 'next/server';
import { databaseService, ViralThreshold } from '@/lib/database/DatabaseService';

// Default viral thresholds mapping to database thresholds
const DEFAULT_THRESHOLDS = {
  SHARE_COUNT: 100,        // 100+ shares = viral moment
  PERFECT_SCORE: 4.8,      // 4.8+ rating = perfect performance
  REALITY_GAP: 2.5,        // 2.5+ gap = comedy gold
  ENGAGEMENT_RATE: 0.3,    // 30% engagement rate
  VELOCITY: 50,            // 50 shares in 1 hour = trending
};

// Map legacy threshold names to database threshold names
const THRESHOLD_MAP = {
  SHARE_COUNT: 'shares_threshold',
  PERFECT_SCORE: 'rating_threshold', 
  REALITY_GAP: 'gap_threshold',
  ENGAGEMENT_RATE: 'engagement_rate',
  VELOCITY: 'growth_rate'
};

/**
 * API route to get viral thresholds
 * GET /api/viral/thresholds
 */
export async function GET(request: NextRequest) {
  try {
    // Get thresholds from database
    const dbThresholds = await databaseService.getViralThresholds();
    
    // Convert from database format to API response format
    const thresholds = convertToLegacyFormat(dbThresholds);
    
    return NextResponse.json({
      thresholds,
      defaults: DEFAULT_THRESHOLDS
    });
  } catch (error) {
    console.error('Error fetching viral thresholds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch viral thresholds' },
      { status: 500 }
    );
  }
}

/**
 * API route to update viral thresholds
 * POST /api/viral/thresholds
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid threshold data' },
        { status: 400 }
      );
    }
    
    // Validate the input values
    const validKeys = Object.keys(DEFAULT_THRESHOLDS);
    const updates: Record<string, number> = {};
    
    for (const key of Object.keys(body)) {
      if (validKeys.includes(key)) {
        const value = parseFloat(body[key]);
        if (!isNaN(value) && value >= 0) {
          updates[key] = value;
        }
      }
    }
    
    // Update thresholds in database
    const updatePromises = Object.entries(updates).map(([legacyKey, value]) => {
      const dbKey = THRESHOLD_MAP[legacyKey as keyof typeof THRESHOLD_MAP];
      if (dbKey) {
        return databaseService.updateViralThreshold({
          threshold_name: dbKey,
          threshold_value: value,
          description: `Updated via API (was ${legacyKey})`
        });
      }
    }).filter(Boolean);
    
    await Promise.all(updatePromises);
    
    // Get updated thresholds
    const dbThresholds = await databaseService.getViralThresholds();
    const thresholds = convertToLegacyFormat(dbThresholds);
    
    console.log('🔧 Viral thresholds updated:', thresholds);
    
    return NextResponse.json({
      success: true,
      thresholds
    });
  } catch (error) {
    console.error('Error updating viral thresholds:', error);
    return NextResponse.json(
      { error: 'Failed to update viral thresholds' },
      { status: 500 }
    );
  }
}

/**
 * API route to reset viral thresholds to defaults
 * DELETE /api/viral/thresholds
 */
export async function DELETE(request: NextRequest) {
  try {
    // Reset to defaults in database
    const updatePromises = Object.entries(DEFAULT_THRESHOLDS).map(([legacyKey, value]) => {
      const dbKey = THRESHOLD_MAP[legacyKey as keyof typeof THRESHOLD_MAP];
      if (dbKey) {
        return databaseService.updateViralThreshold({
          threshold_name: dbKey,
          threshold_value: value,
          description: `Reset to default value (${legacyKey})`
        });
      }
    }).filter(Boolean);
    
    await Promise.all(updatePromises);
    
    // Get updated thresholds
    const dbThresholds = await databaseService.getViralThresholds();
    const thresholds = convertToLegacyFormat(dbThresholds);
    
    return NextResponse.json({
      success: true,
      message: 'Thresholds reset to defaults',
      thresholds
    });
  } catch (error) {
    console.error('Error resetting viral thresholds:', error);
    return NextResponse.json(
      { error: 'Failed to reset viral thresholds' },
      { status: 500 }
    );
  }
}

/**
 * Convert database thresholds to legacy format
 */
function convertToLegacyFormat(dbThresholds: ViralThreshold[]): Record<string, number> {
  const result: Record<string, number> = { ...DEFAULT_THRESHOLDS };
  
  // Create a reverse map from db keys to legacy keys
  const reverseMap: Record<string, string> = {};
  Object.entries(THRESHOLD_MAP).forEach(([legacyKey, dbKey]) => {
    reverseMap[dbKey] = legacyKey;
  });
  
  // Convert database thresholds to legacy format
  dbThresholds.forEach(threshold => {
    const legacyKey = reverseMap[threshold.threshold_name];
    if (legacyKey) {
      result[legacyKey] = threshold.threshold_value;
    }
  });
  
  return result;
}