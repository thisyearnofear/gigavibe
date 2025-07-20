/**
 * Unified Challenge Type System
 * Consolidates all challenge-related types for consistency and DRY principles
 */

// Base challenge interface that all challenge types extend
export interface BaseChallenge {
  id: string;
  title: string;
  artist: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  description?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Audio-related challenge properties
export interface ChallengeAudio {
  previewUrl: string;
  instrumentalUrl: string;
  vocalUrl?: string;
  bpm?: number;
  key?: string;
}

// Social and engagement properties
export interface ChallengeSocial {
  participants: number;
  trending: boolean;
  recentPerformers: Array<{
    username: string;
    avatar: string;
    score: number;
    fid?: number;
  }>;
  viralScore?: number;
  trendingRank?: number;
}

// Economic properties for Zora integration
export interface ChallengeEconomics {
  coinValue?: number;
  totalEarnings?: number;
  marketCap?: number;
  holders?: number;
  priceChange24h?: number;
}

// Complete challenge interface combining all aspects
export interface Challenge extends BaseChallenge, ChallengeAudio, ChallengeSocial, ChallengeEconomics {
  tips?: string[];
  type?: 'viral' | 'structured' | 'featured';
}

// Challenge flow states
export type ChallengeFlowStep = 
  | 'preview' 
  | 'prepare' 
  | 'countdown' 
  | 'recording' 
  | 'playback' 
  | 'rating' 
  | 'sharing'
  | 'complete';

// Challenge result interface
export interface ChallengeResult {
  challengeId: string;
  challengeTitle: string;
  audioUrl: string;
  selfRating: number;
  confidence: 'nervous' | 'confident' | 'very confident';
  duration: number;
  timestamp: Date;
  accuracy?: number;
  communityRating?: number;
  gap?: number;
  submissionId?: string;
  castHash?: string;
  userFid?: number;
}

// Challenge progress tracking
export interface ChallengeProgress {
  currentStep: ChallengeFlowStep;
  startTime: Date;
  recordingTime: number;
  isRecording: boolean;
  hasRecording: boolean;
  audioBlob?: Blob;
  mixedAudioBlob?: Blob;
}

// Challenge discovery and filtering
export interface ChallengeFilters {
  difficulty?: Challenge['difficulty'];
  trending?: boolean;
  type?: Challenge['type'];
  minParticipants?: number;
  tags?: string[];
}

// Challenge service interfaces
export interface ChallengeServiceInterface {
  getChallenges(filters?: ChallengeFilters): Promise<Challenge[]>;
  getChallengeById(id: string): Promise<Challenge | null>;
  getFeaturedChallenges(limit?: number): Promise<Challenge[]>;
  getTrendingChallenges(limit?: number): Promise<Challenge[]>;
  searchChallenges(query: string): Promise<Challenge[]>;
}

// Challenge hooks return types
export interface UseChallengeReturn {
  currentChallenge: Challenge | null;
  progress: ChallengeProgress | null;
  startChallenge: (challenge: Challenge) => void;
  completeChallenge: (result: ChallengeResult) => Promise<void>;
  cancelChallenge: () => void;
  updateProgress: (updates: Partial<ChallengeProgress>) => void;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UseChallengeDiscoveryReturn {
  challenges: Challenge[];
  featuredChallenges: Challenge[];
  trendingChallenges: Challenge[];
  loading: boolean;
  error: string | null;
  refreshChallenges: () => Promise<void>;
  searchChallenges: (query: string) => Promise<void>;
}

// Component prop interfaces
export interface ChallengeCardProps {
  challenge: Challenge;
  onSelect: (challenge: Challenge) => void;
  onPreview?: (challenge: Challenge) => void;
  showEconomics?: boolean;
  showSocial?: boolean;
  variant?: 'compact' | 'detailed' | 'featured';
}

export interface ChallengeFlowProps {
  challenge: Challenge;
  onComplete: (result: ChallengeResult) => void;
  onCancel: () => void;
  initialStep?: ChallengeFlowStep;
}

export interface ChallengeDiscoveryProps {
  onChallengeSelect: (challenge: Challenge) => void;
  onViewAllChallenges?: () => void;
  filters?: ChallengeFilters;
  maxItems?: number;
}