import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/DatabaseService';

/**
 * API route to send notifications about viral coin creation
 * POST /api/notifications/viral-coin
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.performanceId || !body.coinAddress || !body.userId) {
      return NextResponse.json(
        { error: 'Performance ID, user ID, and coin address are required' },
        { status: 400 }
      );
    }
    
    // In production, this would integrate with:
    // - Push notification service
    // - Email service
    // - Social media APIs
    // - Discord/Telegram bots
    
    // Generate notification message
    const title = body.challengeTitle || 'Performance';
    const reason = body.reason || 'Viral performance';
    const message = `🎉 "${title}" has gone viral! (${reason}) Coin created at ${body.coinAddress}`;
    
    // Log the notification for development
    console.log(`📱 NOTIFICATION: ${message}`);
    
    // Determine channels based on viral type
    const channels = ['app'];
    if (body.viralType === 'viral_moment') {
      channels.push('social', 'discord');
    }
    if (body.viralType === 'perfect_score') {
      channels.push('email');
    }
    
    // Check user notification preferences
    const userPrefs = await databaseService.getUserNotificationPreferences(body.userId);
    const shouldNotify = !userPrefs || userPrefs.viral_notifications;
    
    if (shouldNotify) {
      // Store notification in database
      await databaseService.createNotification({
        user_id: body.userId,
        notification_type: 'viral_coin_created',
        content: message
      });
      
      // Also track as an analytics event
      await databaseService.trackEvent({
        event_type: 'notification_sent',
        user_id: body.userId,
        performance_id: body.performanceId,
        event_data: {
          notification_type: 'viral_coin_created',
          coin_address: body.coinAddress,
          channels,
          viral_type: body.viralType
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message,
      channels,
      notified: shouldNotify
    });
  } catch (error) {
    console.error('Error sending viral coin notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

/**
 * API route to get notification history
 * GET /api/notifications/viral-coin
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Retrieve user's notifications from database
    const notifications = await databaseService.getUserNotifications(userId);
    
    // Filter to only viral coin notifications
    const viralCoinNotifications = notifications.filter(
      notification => notification.notification_type === 'viral_coin_created'
    );
    
    return NextResponse.json({
      notifications: viralCoinNotifications,
      count: viralCoinNotifications.length
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification history' },
      { status: 500 }
    );
  }
}