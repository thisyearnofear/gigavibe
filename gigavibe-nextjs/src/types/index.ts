// Core Audio Types
export interface PitchData {
  frequency: number;
  note: string;
  octave: number;
  cents: number;
  isInTune: boolean;
  volume: number;
  confidence: number;
  timestamp: number;
}

export interface AudioAnalysis {
  pitchHistory: number[];
  volumeHistory: number[];
  stabilityScore: number;
  averageDeviation: number;
  sessionDuration: number;
}

// Challenge Types
export interface VocalChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'scale' | 'interval' | 'rhythm' | 'range' | 'harmony';
  notes: string[];
  targetFrequencies: number[];
  timing: number[];
  tolerance: number;
  estimatedDuration: number;
  socialPrompt: string;
  createdBy: 'ai' | string;
  tags: string[];
  createdAt: number;
}

export interface ChallengeProgress {
  currentNoteIndex: number;
  notesHit: boolean[];
  startTime: number;
  isComplete: boolean;
  score: number;
  accuracy: number;
  timingAccuracy: number[];
}

export interface ChallengeResult {
  challengeId: string;
  userFid?: string;
  score: number;
  accuracy: number;
  completionTime: number;
  recording?: string; // FilCDN CID
  timestamp: number;
  socialShared: boolean;
}

// User Profile Types
export interface UserVocalProfile {
  fid: string;
  username?: string;
  lowestNote: string;
  highestNote: string;
  averageAccuracy: number;
  completedChallenges: number;
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  weakAreas: string[];
  strongAreas: string[];
  totalPracticeTime: number;
  lastActive: number;
  achievements: string[];
}

// Social Types
export interface LeaderboardEntry {
  fid: string;
  username?: string;
  score: number;
  accuracy: number;
  challengesCompleted: number;
  rank: number;
  avatar?: string;
}

export interface SocialChallenge extends VocalChallenge {
  participants: string[];
  leaderboard: LeaderboardEntry[];
  isActive: boolean;
  endTime: number;
}

// Storage Types
export interface StoredData {
  type: 'challenge_result' | 'user_profile' | 'vocal_recording' | 'leaderboard';
  data: any;
  userFid?: string;
  timestamp: number;
  version: string;
}

// App State Types
export interface AppState {
  currentScreen: 'tuner' | 'practice' | 'progress' | 'settings' | 'social';
  isListening: boolean;
  currentChallenge: VocalChallenge | null;
  challengeProgress: ChallengeProgress | null;
  userProfile: UserVocalProfile | null;
}

// Hook Return Types
export interface UsePitchDetectionReturn {
  pitchData: PitchData;
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  error: string | null;
  hasPermission: boolean;
}

export interface UseChallengeReturn {
  currentChallenge: VocalChallenge | null;
  challengeProgress: ChallengeProgress | null;
  startChallenge: (challenge: VocalChallenge) => void;
  updateProgress: (frequency: number, note: string, octave: number, userFid?: string) => void;
  completeChallenge: () => Promise<ChallengeResult | null>;
  resetChallenge: () => void;
  isActive: boolean;
}

export interface UseSocialReturn {
  shareToFarcaster: (result: ChallengeResult) => Promise<void>;
  getLeaderboard: (challengeId?: string) => Promise<LeaderboardEntry[]>;
  getUserProfile: (fid: string) => Promise<UserVocalProfile | null>;
  updateUserProfile: (profile: Partial<UserVocalProfile>) => Promise<void>;
}

// Configuration Types
export interface AudioConfig {
  sampleRate: number;
  fftSize: number;
  smoothingTimeConstant: number;
  minVolume: number;
  maxVolume: number;
}

export interface ChallengeConfig {
  defaultTolerance: number;
  timingToleranceMs: number;
  minNoteHoldTime: number;
  maxChallengeLength: number;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// Event Types
export interface ChallengeEvent {
  type: 'note_hit' | 'note_missed' | 'challenge_complete' | 'challenge_failed';
  data: any;
  timestamp: number;
}

export interface SocialEvent {
  type: 'challenge_shared' | 'leaderboard_updated' | 'achievement_unlocked';
  data: any;
  timestamp: number;
}
