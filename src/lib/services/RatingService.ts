/**
 * Dedicated rating service
 * Modular, performant rating calculations
 */

import { supabase } from '@/integrations/supabase/client';

export interface RatingData {
  currentAverage: number;
  totalRatings: number;
  newAverage: number;
}

export class RatingService {
  private static instance: RatingService;
  private ratingCache = new Map<string, { average: number; count: number; lastUpdated: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): RatingService {
    if (!RatingService.instance) {
      RatingService.instance = new RatingService();
    }
    return RatingService.instance;
  }

  async calculateNewRating(performanceId: string, newRating: number): Promise<RatingData> {
    const cached = this.getCachedRating(performanceId);
    
    if (cached) {
      return this.computeNewAverage(cached.average, cached.count, newRating);
    }

    // Only fetch from DB if not cached - more performant
    const ratings = await this.fetchRecentRatings(performanceId);
    const currentAverage = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
    const currentCount = ratings.length;

    // Cache the result
    this.setCachedRating(performanceId, currentAverage, currentCount);

    return this.computeNewAverage(currentAverage, currentCount, newRating);
  }

  private computeNewAverage(currentAverage: number, currentCount: number, newRating: number): RatingData {
    const newAverage = currentCount > 0 
      ? ((currentAverage * currentCount) + newRating) / (currentCount + 1)
      : newRating;

    return {
      currentAverage,
      totalRatings: currentCount + 1,
      newAverage: Math.round(newAverage * 100) / 100
    };
  }

  private async fetchRecentRatings(performanceId: string): Promise<number[]> {
    const { data } = await supabase
      .from('analytics_events')
      .select('event_data')
      .eq('event_type', 'performance_rated')
      .eq('performance_id', performanceId)
      .order('server_timestamp', { ascending: false })
      .limit(50); // Reduced from 100 for better performance

    return data?.map(event => {
      const eventData = event.event_data as any;
      return eventData?.rating;
    }).filter(r => typeof r === 'number') || [];
  }

  private getCachedRating(performanceId: string) {
    const cached = this.ratingCache.get(performanceId);
    if (cached && Date.now() - cached.lastUpdated < this.CACHE_TTL) {
      return cached;
    }
    return null;
  }

  private setCachedRating(performanceId: string, average: number, count: number) {
    this.ratingCache.set(performanceId, {
      average,
      count,
      lastUpdated: Date.now()
    });
  }
}