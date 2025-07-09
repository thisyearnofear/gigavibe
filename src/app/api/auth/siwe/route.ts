import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('SIWE authentication request received');

    if (!body.message || !body.signature) {
      return NextResponse.json(
        { error: 'Missing message or signature' },
        { status: 400 }
      );
    }

    // Parse the SIWE message
    let siweMessage: SiweMessage;
    try {
      // Create a new SIWE message from the stringified message
      siweMessage = new SiweMessage(body.message);
    } catch (error) {
      console.error('Failed to parse SIWE message:', error);
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Verify the signature
    try {
      const fields = await siweMessage.verify({
        signature: body.signature,
        domain: body.domain || request.headers.get('host') || undefined,
      });

      if (!fields.success) {
        return NextResponse.json(
          { error: 'Signature verification failed' },
          { status: 401 }
        );
      }

      // Check if the message is expired
      const expirationTime = fields.data.expirationTime;
      if (expirationTime && new Date(expirationTime) < new Date()) {
        return NextResponse.json(
          { error: 'Message has expired' },
          { status: 401 }
        );
      }

      // Extract user information from the verified message
      const address = fields.data.address;
      
      // Extract custom fields if present (like FID)
      const statement = fields.data.statement || '';
      const fidMatch = statement.match(/FID:(\d+)/);
      const fid = fidMatch ? fidMatch[1] : undefined;
      
      const usernameMatch = statement.match(/Username:([a-zA-Z0-9_-]+)/);
      const username = usernameMatch ? usernameMatch[1] : undefined;

      // Here you would typically:
      // 1. Store the user session in a database or cookie
      // 2. Create a JWT token or session ID
      
      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
        user: {
          address,
          fid: fid || undefined,
          username: username || address.substring(0, 8)
        }
      });
    } catch (error) {
      console.error('Signature verification error:', error);
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('SIWE authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}