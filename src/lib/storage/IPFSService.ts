'use client';

// Simple IPFS service using public gateways
export class IPFSService {
  private static readonly UPLOAD_ENDPOINT = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  private static readonly GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs/';
  private static readonly JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 2000; // 2 seconds

  static async uploadAudio(audioBlob: Blob, filename: string): Promise<string> {
    try {
      if (!this.JWT) {
        throw new Error('Pinata JWT not configured');
      }

      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', audioBlob, filename);
      
      // Add metadata
      const metadata = JSON.stringify({
        name: filename,
        keyvalues: {
          app: 'gigavibe',
          type: 'audio',
          timestamp: Date.now()
        }
      });
      formData.append('pinataMetadata', metadata);
      
      // Add options (including making the upload public)
      const options = JSON.stringify({
        cidVersion: 1,
        wrapWithDirectory: false
      });
      formData.append('pinataOptions', options);
      
      // Upload to Pinata with retries
      let lastError;
      for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
        try {
          const response = await fetch(this.UPLOAD_ENDPOINT, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.JWT}`
            },
            body: formData
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Pinata API error (${response.status}): ${errorText}`);
          }
          
          const result = await response.json();
          console.log(`Uploaded to IPFS: ${filename} -> ${result.IpfsHash}`);
          return result.IpfsHash;
        } catch (error) {
          console.warn(`IPFS upload attempt ${attempt + 1} failed:`, error);
          lastError = error;
          
          // Wait before retrying
          if (attempt < this.MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
          }
        }
      }
      
      throw lastError || new Error('Maximum upload retries exceeded');
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  static getAudioUrl(ipfsHash: string): string {
    return `${this.GATEWAY_URL}${ipfsHash}`;
  }

  static async uploadJSON(data: any, filename: string): Promise<string> {
    try {
      const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      return await this.uploadAudio(jsonBlob, filename);
    } catch (error) {
      console.error('JSON upload failed:', error);
      throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
    }
  }
}