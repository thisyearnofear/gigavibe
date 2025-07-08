'use client';

// Simple IPFS service using public gateways
export class IPFSService {
  private static readonly UPLOAD_ENDPOINT = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  private static readonly GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs/';

  static async uploadAudio(audioBlob: Blob, filename: string): Promise<string> {
    try {
      // For demo purposes, we'll use a mock IPFS hash
      // In production, you'd integrate with Pinata, Web3.Storage, or similar
      const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Mock upload: ${filename} -> ${mockHash}`);
      return mockHash;
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw new Error('Failed to upload to IPFS');
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
      throw new Error('Failed to upload JSON to IPFS');
    }
  }
}