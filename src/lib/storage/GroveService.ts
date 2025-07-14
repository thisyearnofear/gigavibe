'use client';

/**
 * Grove Storage Service
 * Storage layer implementation for Web3 apps using Grove
 */

export class GroveService {
  private static instance: GroveService;
  private storageClient: any = null;
  private isInitialized = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): GroveService {
    if (!GroveService.instance) {
      GroveService.instance = new GroveService();
    }
    return GroveService.instance;
  }

  /**
   * Initialize the Grove storage client
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Dynamically import the storage client to prevent issues with SSR
      const { StorageClient } = await import('@lens-chain/storage-client');
      
      this.storageClient = StorageClient.create();
      this.isInitialized = true;
      console.log('✅ Grove storage client initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Grove storage:', error);
      return false;
    }
  }

  /**
   * Upload a file to Grove storage
   * @param blob - Audio blob to upload
   * @param filename - Filename to use
   * @returns Promise with the URI and URL of the uploaded file
   */
  public async uploadFile(blob: Blob, filename: string): Promise<{ uri: string; gatewayUrl: string }> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Grove storage client not initialized');
      }
    }

    try {
      // Create a File object from the Blob
      const file = new File([blob], filename, { type: blob.type });

      // Import required components for ACL
      const { immutable } = await import('@lens-chain/storage-client');
      
      // Use Mainnet ID (1) or a testnet ID if this is a test environment
      const chainId = 1; // Ethereum mainnet
      const acl = immutable(chainId);

      // Upload the file
      const response = await this.storageClient.uploadFile(file, { acl });
      
      console.log('✅ File uploaded to Grove:', response);
      
      return {
        uri: response.uri,
        gatewayUrl: response.gatewayUrl
      };
    } catch (error) {
      console.error('❌ Failed to upload file to Grove:', error);
      throw error;
    }
  }

  /**
   * Check if Grove storage is supported in this environment
   */
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'File' in window && 'Blob' in window;
  }
}