import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract notification data
    const { 
      notificationDetails, 
      title, 
      body: messageBody, 
      targetUrl 
    } = body;

    // Validate required fields
    if (!notificationDetails?.url || !notificationDetails?.token) {
      return NextResponse.json(
        { error: 'Missing notification URL or token' },
        { status: 400 }
      );
    }

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: 'Missing notification title or body' },
        { status: 400 }
      );
    }

    // Send notification to Farcaster
    const notificationResponse = await fetch(notificationDetails.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${notificationDetails.token}`
      },
      body: JSON.stringify({
        notificationId: `gigavibe-${Date.now()}`,
        title,
        body: messageBody,
        targetUrl: targetUrl || `${process.env.NEXT_PUBLIC_URL || 'https://gigavibe.app'}`,
        tokens: [notificationDetails.token]
      })
    });

    if (!notificationResponse.ok) {
      const errorText = await notificationResponse.text();
      console.error('Farcaster notification failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to send notification to Farcaster' },
        { status: 500 }
      );
    }

    const result = await notificationResponse.json();
    
    console.log('Notification sent successfully:', {
      title,
      body: messageBody,
      targetUrl,
      result
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Notification sent successfully',
      result 
    });
    
  } catch (error) {
    console.error('Notification proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}