/**
 * Performance and Upload Types
 * 
 * Clean, type-safe definitions for performance submissions
 */

export interface PerformanceData {
  // Challenge context
  challengeId: string;
  challengeTitle: string;
  challengeType: 'viral' | 'structured';
  challengeDifficulty: 'Easy' | 'Medium' | 'Hard';
  
  // Performance metrics
  accuracy: number;
  duration: number;
  selfRating: number; // 1-5 stars (for Dunning-Kruger comparison)
  
  // Audio details
  audioFormat: string;
  fileSize: number;
  isMixed: boolean;
  recordingQuality: 'high' | 'medium' | 'low';
  
  // Timing
  timestamp: number;
  completedAt: string;
}

export interface UserContext {
  userId: string;
  username: string;
  displayName: string;
  authMethod: 'farcaster' | 'ethereum';
  avatarUrl?: string;
  canPost: boolean;
  fid?: number;
}

export interface PerformanceMetadata extends PerformanceData {
  // User context
  user: UserContext;
  
  // Social context
  intendedForSharing: boolean;
  shareToFarcaster: boolean;
  
  // Technical details
  deviceInfo: string;
  uploadMethod: 'filcdn' | 'grove' | 'local' | 'none';
  uploadAttempts: number;
}

export interface UploadProgress {
  stage: 'preparing' | 'uploading' | 'processing' | 'complete';
  progress: number; // 0-100
  message: string;
  canCancel: boolean;
}

export interface UploadResult {
  success: boolean;
  recordingId: string;
  storageType: 'filcdn' | 'grove' | 'local' | 'none';
  url?: string;
  metadata: PerformanceMetadata;
  error?: string;
}

export interface DunningKrugerData {
  selfRating: number;
  publicRating?: number;
  ratingCount: number;
  confidence: 'overconfident' | 'accurate' | 'underconfident';
  feedback: string;
}

export interface SocialShareOptions {
  platform: 'farcaster';
  message: string;
  includeAudio: boolean;
  includeChallenge: boolean;
  tags?: string[];
}