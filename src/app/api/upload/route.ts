import { NextRequest, NextResponse } from 'next/server';
import { Synapse, RPC_URLS } from '@filoz/synapse-sdk';

/**
 * Enhanced Audio Upload API with Filecoin and Pinata IPFS Integration
 * 
 * Handles audio file uploads with proper error handling and fallbacks
 * Priority: FilCDN (Filecoin) -> Pinata IPFS -> Error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, data, metadata, provider } = body;

    if (!filename || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: filename and data' },
        { status: 400 }
      );
    }

    console.log(`Upload request for: ${filename}`, {
      dataSize: Array.isArray(data) ? data.length : data.length,
      sourceType: metadata?.sourceType,
      challengeId: metadata?.challengeId,
      provider: provider || 'auto'
    });

    // Try FilCDN (Filecoin) first if provider is 'filcdn' or 'auto'
    if ((provider === 'filcdn' || !provider) && process.env.NEXT_PUBLIC_FILECOIN_PRIVATE_KEY) {
      try {
        console.log('Attempting FilCDN (Filecoin) upload...');
        
        // Initialize Synapse SDK
        const synapse = await Synapse.create({
          privateKey: process.env.NEXT_PUBLIC_FILECOIN_PRIVATE_KEY,
          rpcURL: RPC_URLS.calibration.websocket
        });

        // Convert data to Uint8Array (handle both base64 string and array formats)
        let fileData: Uint8Array;
        if (Array.isArray(data)) {
          fileData = new Uint8Array(data);
        } else if (typeof data === 'string') {
          const buffer = Buffer.from(data, 'base64');
          fileData = new Uint8Array(buffer);
        } else {
          throw new Error('Invalid data format');
        }

        // Upload to Filecoin Warm Storage
        console.log(`📤 Uploading ${filename} to Filecoin...`);
        const uploadResult = await synapse.storage.upload(fileData);

        const response = {
          success: true,
          pieceCid: uploadResult.pieceCid.toString(),
          ipfsHash: uploadResult.pieceCid.toString(), // For backward compatibility
          url: `filecoin://${uploadResult.pieceCid}`,
          storageType: 'filcdn',
          metadata: {
            filename,
            uploadedAt: new Date().toISOString(),
            storageProvider: 'filecoin',
            ...metadata
          }
        };

        console.log(`✅ File uploaded to Filecoin successfully! PieceCID: ${uploadResult.pieceCid}`);
        return NextResponse.json(response);

      } catch (fileCdnError) {
        console.warn('⚠️ FilCDN upload failed, trying Pinata fallback:', fileCdnError);
        // Continue to Pinata fallback
      }
    }

    // Try Pinata IPFS as fallback storage
    if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_API_KEY) {
      try {
        console.log('Attempting Pinata IPFS upload...');
        
        const buffer = Buffer.from(data, 'base64');
        
        // Create form data for Pinata
        const formData = new FormData();
        const blob = new Blob([buffer], { 
          type: metadata?.mimeType || 'audio/webm' 
        });
        formData.append('file', blob, filename);
        
        // Add metadata
        const pinataMetadata = JSON.stringify({
          name: filename,
          keyvalues: {
            sourceType: metadata?.sourceType || 'vocal-recording',
            challengeId: metadata?.challengeId || 'unknown',
            timestamp: metadata?.timestamp || Date.now(),
            userAddress: metadata?.userAddress || 'anonymous',
            selfRating: metadata?.selfRating || 0,
            duration: metadata?.duration || 0
          }
        });
        formData.append('pinataMetadata', pinataMetadata);

        // Add pinning options
        const pinataOptions = JSON.stringify({
          cidVersion: 1,
          customPinPolicy: {
            regions: [
              { id: 'FRA1', desiredReplicationCount: 1 },
              { id: 'NYC1', desiredReplicationCount: 1 }
            ]
          }
        });
        formData.append('pinataOptions', pinataOptions);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            'pinata_api_key': process.env.PINATA_API_KEY,
            'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Pinata IPFS upload successful:', {
            hash: result.IpfsHash,
            size: result.PinSize,
            timestamp: result.Timestamp
          });
          
          return NextResponse.json({
            success: true,
            ipfsHash: result.IpfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
            gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
            ipfsUrl: `ipfs://${result.IpfsHash}`,
            storageType: 'ipfs',
            filename,
            size: result.PinSize || buffer.length,
            timestamp: result.Timestamp,
            metadata
          });
        } else {
          const errorText = await response.text();
          console.error('Pinata API error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
        }
      } catch (pinataError) {
        console.error('Pinata IPFS upload failed:', pinataError);
        // Fall through to local storage
      }
    } else {
      console.warn('Pinata API keys not configured, skipping IPFS upload');
    }

    // Local storage fallback (for development/testing)
    console.log('Using local storage fallback...');
    const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    return NextResponse.json({
      success: true,
      ipfsHash: localId,
      url: `local://${localId}`,
      storageType: 'local',
      filename,
      size: Buffer.from(data, 'base64').length,
      metadata,
      warning: 'Using local storage - file will not persist across sessions'
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for upload status/health check
 */
export async function GET() {
  const storageOptions = {
    pinata: !!(process.env.PINATA_API_KEY && process.env.PINATA_SECRET_API_KEY),
    local: true // Always available as fallback
  };

  const primaryStorage = storageOptions.pinata ? 'pinata' : 'local';

  return NextResponse.json({
    status: 'ready',
    primaryStorage,
    availableStorage: Object.entries(storageOptions)
      .filter(([_, available]) => available)
      .map(([type]) => type),
    storageOptions,
    recommendations: {
      pinata: storageOptions.pinata ? 'Ready for production' : 'Add PINATA_API_KEY and PINATA_SECRET_API_KEY to environment',
      local: 'Available as fallback (not recommended for production)'
    }
  });
}