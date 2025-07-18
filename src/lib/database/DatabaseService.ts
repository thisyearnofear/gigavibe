import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';

// Type aliases for better readability
export type User = Tables<'users'>;
export type Performance = Tables<'performances'>;
export type PerformanceMetrics = Tables<'performance_metrics'>;
export type PerformanceCoin = Tables<'performance_coins'>;
export type ViralQueueItem = Tables<'viral_queue'>;
export type ViralThreshold = Tables<'viral_thresholds'>;
export type AnalyticsEvent = Tables<'analytics_events'>;
export type Notification = Tables<'notifications'>;
export type NotificationPreference = Tables<'notification_preferences'>;

/**
 * DatabaseService provides methods to interact with the Supabase database
 */
class DatabaseService {
  // User methods
  async getUserByWallet(walletAddress: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error) return null;
    return data;
  }

  async getUserByFarcasterFid(fid: number): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('farcaster_fid', fid)
      .single();
    
    if (error) return null;
    return data;
  }

  async createOrUpdateUser(user: Partial<User> & { wallet_address: string }): Promise<User | null> {
    // Check if user exists
    const existingUser = await this.getUserByWallet(user.wallet_address);
    
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          farcaster_fid: user.farcaster_fid,
          display_name: user.display_name,
          pfp_url: user.pfp_url,
          bio: user.bio,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', user.wallet_address)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to update user: ${error.message}`);
      return data;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...user,
          id: uuidv4()
        })
        .select()
        .single();
      
      if (error) throw new Error(`Failed to create user: ${error.message}`);
      return data;
    }
  }

  // Performance methods
  async getPerformanceById(id: string): Promise<Performance | null> {
    const { data, error } = await supabase
      .from('performances')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  async getPerformanceByCastId(castId: string): Promise<Performance | null> {
    const { data, error } = await supabase
      .from('performances')
      .select('*')
      .eq('farcaster_cast_id', castId)
      .single();
    
    if (error) return null;
    return data;
  }

  async createPerformance(performance: Partial<Performance> & { farcaster_cast_id: string }): Promise<Performance | null> {
    const { data, error } = await supabase
      .from('performances')
      .insert({
        ...performance,
        id: uuidv4()
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create performance: ${error.message}`);
    return data;
  }

  async getRecentPerformances(limit: number = 10): Promise<Performance[]> {
    const { data, error } = await supabase
      .from('performances')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(`Failed to get recent performances: ${error.message}`);
    return data;
  }

  // Performance metrics methods
  async getPerformanceMetrics(performanceId: string): Promise<PerformanceMetrics | null> {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('performance_id', performanceId)
      .single();
    
    if (error) return null;
    return data;
  }

  async updatePerformanceMetrics(metrics: Partial<PerformanceMetrics> & { performance_id: string }): Promise<PerformanceMetrics | null> {
    const existingMetrics = await this.getPerformanceMetrics(metrics.performance_id);
    
    if (existingMetrics) {
      // Update existing metrics
      const { data, error } = await supabase
        .from('performance_metrics')
        .update({
          likes_count: metrics.likes_count || existingMetrics.likes_count,
          replies_count: metrics.replies_count || existingMetrics.replies_count,
          recasts_count: metrics.recasts_count || existingMetrics.recasts_count,
          views_count: metrics.views_count || existingMetrics.views_count,
          shares_count: metrics.shares_count || existingMetrics.shares_count,
          last_updated: new Date().toISOString()
        })
        .eq('performance_id', metrics.performance_id)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to update metrics: ${error.message}`);
      return data;
    } else {
      // Create new metrics
      const { data, error } = await supabase
        .from('performance_metrics')
        .insert({
          ...metrics,
          id: uuidv4(),
          last_updated: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw new Error(`Failed to create metrics: ${error.message}`);
      return data;
    }
  }

  // Performance coin methods
  async getPerformanceCoin(performanceId: string): Promise<PerformanceCoin | null> {
    const { data, error } = await supabase
      .from('performance_coins')
      .select('*')
      .eq('performance_id', performanceId)
      .single();
    
    if (error) return null;
    return data;
  }

  async createPerformanceCoin(coin: Partial<PerformanceCoin> & { performance_id: string; coin_address: string }): Promise<PerformanceCoin | null> {
    const { data, error } = await supabase
      .from('performance_coins')
      .insert({
        ...coin,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create performance coin: ${error.message}`);
    return data;
  }

  async updateCoinPrice(coinAddress: string, currentPrice: number): Promise<void> {
    const { error } = await supabase
      .from('performance_coins')
      .update({
        current_price: currentPrice,
        updated_at: new Date().toISOString()
      })
      .eq('coin_address', coinAddress);
    
    if (error) throw new Error(`Failed to update coin price: ${error.message}`);
  }

  // Viral detection methods
  async getViralThresholds(): Promise<ViralThreshold[]> {
    const { data, error } = await supabase
      .from('viral_thresholds')
      .select('*');
    
    if (error) throw new Error(`Failed to get viral thresholds: ${error.message}`);
    return data;
  }

  async updateViralThreshold(threshold: Partial<ViralThreshold> & { threshold_name: string; threshold_value: number }): Promise<ViralThreshold | null> {
    const { data, error } = await supabase
      .from('viral_thresholds')
      .update({
        threshold_value: threshold.threshold_value,
        description: threshold.description,
        updated_at: new Date().toISOString()
      })
      .eq('threshold_name', threshold.threshold_name)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update viral threshold: ${error.message}`);
    return data;
  }

  async addToViralQueue(queueItem: Partial<ViralQueueItem> & { performance_id: string; detection_score: number; status: string }): Promise<ViralQueueItem | null> {
    const { data, error } = await supabase
      .from('viral_queue')
      .insert({
        ...queueItem,
        id: uuidv4(),
        detected_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to add to viral queue: ${error.message}`);
    return data;
  }

  async getViralQueue(): Promise<ViralQueueItem[]> {
    const { data, error } = await supabase
      .from('viral_queue')
      .select('*')
      .eq('status', 'pending')
      .order('detected_at', { ascending: true });
    
    if (error) throw new Error(`Failed to get viral queue: ${error.message}`);
    return data;
  }

  async updateViralQueueItemStatus(
    id: string, 
    status: 'processing' | 'completed' | 'failed',
    resultMessage?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('viral_queue')
      .update({
        status,
        processed_at: new Date().toISOString(),
        result_message: resultMessage
      })
      .eq('id', id);
    
    if (error) throw new Error(`Failed to update viral queue item: ${error.message}`);
  }

  async clearViralQueue(): Promise<void> {
    const { error } = await supabase
      .from('viral_queue')
      .delete()
      .eq('status', 'pending');
    
    if (error) throw new Error(`Failed to clear viral queue: ${error.message}`);
  }

  // Analytics methods
  async trackEvent(event: Partial<AnalyticsEvent> & { event_type: string }): Promise<void> {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        ...event,
        id: uuidv4(),
        server_timestamp: new Date().toISOString()
      });
    
    if (error) throw new Error(`Failed to track analytics event: ${error.message}`);
  }

  // Notification methods
  async createNotification(notification: Partial<Notification> & { user_id: string; notification_type: string; content: string }): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        id: uuidv4(),
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create notification: ${error.message}`);
    return data;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get user notifications: ${error.message}`);
    return data;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
  }

  async getUserNotificationPreferences(userId: string): Promise<NotificationPreference | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) return null;
    return data;
  }

  async updateNotificationPreferences(prefs: Partial<NotificationPreference> & { user_id: string }): Promise<NotificationPreference | null> {
    const existingPrefs = await this.getUserNotificationPreferences(prefs.user_id);
    
    if (existingPrefs) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('notification_preferences')
        .update({
          viral_notifications: prefs.viral_notifications !== undefined ? prefs.viral_notifications : existingPrefs.viral_notifications,
          coin_price_notifications: prefs.coin_price_notifications !== undefined ? prefs.coin_price_notifications : existingPrefs.coin_price_notifications,
          engagement_notifications: prefs.engagement_notifications !== undefined ? prefs.engagement_notifications : existingPrefs.engagement_notifications,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', prefs.user_id)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to update notification preferences: ${error.message}`);
      return data;
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({
          id: uuidv4(),
          user_id: prefs.user_id,
          viral_notifications: prefs.viral_notifications !== undefined ? prefs.viral_notifications : true,
          coin_price_notifications: prefs.coin_price_notifications !== undefined ? prefs.coin_price_notifications : true,
          engagement_notifications: prefs.engagement_notifications !== undefined ? prefs.engagement_notifications : true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw new Error(`Failed to create notification preferences: ${error.message}`);
      return data;
    }
  }

  // Discovery feed methods using database views
  async getDiscoveryFeedRecent(limit: number = 20, offset: number = 0): Promise<any[]> {
    const { data, error } = await supabase
      .from('discovery_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw new Error(`Failed to get recent discovery feed: ${error.message}`);
    return data || [];
  }

  async getDiscoveryFeedTrending(limit: number = 20, offset: number = 0): Promise<any[]> {
    const { data, error } = await supabase
      .from('discovery_feed')
      .select('*')
      .order('trending_score', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw new Error(`Failed to get trending discovery feed: ${error.message}`);
    return data || [];
  }

  async getDiscoveryFeedViral(limit: number = 20, offset: number = 0): Promise<any[]> {
    const { data, error } = await supabase
      .from('discovery_feed')
      .select('*')
      .order('viral_score', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw new Error(`Failed to get viral discovery feed: ${error.message}`);
    return data || [];
  }

  async getDiscoveryFeedForYou(limit: number = 20, offset: number = 0): Promise<any[]> {
    // For "For You" feed, we can use a combination of factors
    // For now, let's use a mix of recent and trending
    const { data, error } = await supabase
      .from('discovery_feed')
      .select('*')
      .order('trending_score', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw new Error(`Failed to get for you discovery feed: ${error.message}`);
    return data || [];
  }

  // Challenge leaderboard methods
  async getChallengeLeaderboard(challengeId?: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    let query = supabase
      .from('challenge_leaderboard')
      .select('*');
    
    if (challengeId) {
      query = query.eq('challenge_id', challengeId);
    }
    
    const { data, error } = await query
      .order('rank', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (error) throw new Error(`Failed to get challenge leaderboard: ${error.message}`);
    return data || [];
  }

  // Challenge results methods (using challenge_results table)
  async getChallengeResults(challengeId?: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    let query = supabase
      .from('challenge_results')
      .select('*');
    
    if (challengeId) {
      query = query.eq('challenge_id', challengeId);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw new Error(`Failed to get challenge results: ${error.message}`);
    return data || [];
  }

  async getRecentChallengeResults(hours: number = 24, limit: number = 20): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('challenge_results')
      .select('*')
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(`Failed to get recent challenge results: ${error.message}`);
    return data || [];
  }
}

// Export a singleton instance
export const databaseService = new DatabaseService();