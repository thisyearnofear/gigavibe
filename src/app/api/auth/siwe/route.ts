import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { AUTH_CONFIG, isProductionDomain, getErrorMessage, getSuccessMessage } from '@/config/auth.config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('SIWE authentication request received');
    console.log('Request Origin:', origin);
    console.log('Request Host:', host);
    console.log('Allowed Domains:', AUTH_CONFIG.SECURITY.ALLOWED_DOMAINS);
    
    // Validate request origin in production
    if (AUTH_CONFIG.SECURITY.VALIDATE_ORIGIN) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      
      if (origin && !isProductionDomain(new URL(origin).hostname)) {
        return NextResponse.json(
          { error: getErrorMessage('INVALID_DOMAIN') },
          { status: 403 }
        );
      }
    }

    if (!body.message || !body.signature) {
      return NextResponse.json(
        { error: getErrorMessage('INVALID_SIGNATURE') },
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
        { error: getErrorMessage('INVALID_SIGNATURE') },
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
          { error: getErrorMessage('INVALID_SIGNATURE') },
          { status: 401 }
        );
      }

      // Check if the message is expired
      const expirationTime = fields.data.expirationTime;
      if (expirationTime && new Date(expirationTime) < new Date()) {
        return NextResponse.json(
          { error: getErrorMessage('EXPIRED_SESSION') },
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
        message: getSuccessMessage('SIGN_IN') || 'Authentication successful',
        user: {
          address,
          fid: fid || undefined,
          username: username || `${address.substring(0, 6)}...${address.substring(38)}`
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Signature verification error:', error);
      return NextResponse.json(
        { error: getErrorMessage('INVALID_SIGNATURE') },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('SIWE authentication error:', error);
    return NextResponse.json(
      { error: getErrorMessage('NETWORK_ERROR') },
      { status: 500 }
    );
  }
}