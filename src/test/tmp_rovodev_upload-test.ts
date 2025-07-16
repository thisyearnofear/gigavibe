/**
 * Test script for the new upload system
 * Run this to verify IPFS upload is working correctly
 */

import { uploadService } from '@/lib/audio/UploadService';

export async function testUploadSystem() {
  console.log('🧪 Testing Upload System...');
  
  try {
    // Check service health first
    console.log('1. Checking service health...');
    const health = await uploadService.checkHealth();
    console.log('Service Health:', health);
    
    // Create a test audio blob (silent audio)
    console.log('2. Creating test audio blob...');
    const testAudioData = new Uint8Array(1024).fill(0); // Silent audio
    const testBlob = new Blob([testAudioData], { type: 'audio/webm' });
    
    // Validate the blob
    console.log('3. Validating audio blob...');
    const validation = uploadService.validateAudioBlob(testBlob);
    console.log('Validation result:', validation);
    
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.error}`);
    }
    
    // Attempt upload
    console.log('4. Attempting upload...');
    const result = await uploadService.uploadAudio(
      testBlob, 
      'test-recording.webm',
      {
        sourceType: 'test',
        challengeId: 'test-challenge',
        userAddress: '0x1234567890123456789012345678901234567890',
        selfRating: 5,
        duration: 10
      }
    );
    
    console.log('Upload result:', result);
    
    if (result.success) {
      console.log('✅ Upload test PASSED');
      console.log(`Storage type: ${result.storageType}`);
      console.log(`URL: ${result.url}`);
      console.log(`IPFS Hash: ${result.ipfsHash}`);
    } else {
      console.log('❌ Upload test FAILED');
      console.log(`Error: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Upload test ERROR:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export for use in components
export default testUploadSystem;