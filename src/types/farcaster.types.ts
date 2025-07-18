/**
 * Unified Farcaster Types
 * All Farcaster-related type definitions in one place
 * Following DRY principles to avoid type duplication
 */

import { Challenge, ChallengeResult } from './challenge.types';

// Core Farcaster Types
export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  isVerified?: boolean;
  followerCount?: number;
  followingCount?: number;
}

export interface FarcasterCast {
  hash: string;
  threadHash: string;
  parentHash?: string;
  parentFid?: number;
  parentUrl?: string;
  text: string;
  timestamp: string;
  author: FarcasterUser;
  mentions?: FarcasterUser[];
  mentionsPositions?: number[];
  embeds?: FarcasterEmbed[];
  reactions?: {
    likes: FarcasterReaction[];
    recasts: FarcasterReaction[];
    replies: FarcasterCast[];
  };
  replyCount: number;
  recastCount: number;
  likeCount: number;
  channelId?: string;
}

export interface FarcasterEmbed {
  url?: string;
  castId?: {
    fid: number;
    hash: string;
  };
  metadata?: {
    contentType?: string;
    contentLength?: number;
    image?: {
      url: string;
      width?: number;
      height?: number;
    };
  };
}

export interface FarcasterReaction {
  fid: number;
  fname: string;
  timestamp: string;
}

// Frame Types
export interface FrameData {
  version: string;
  image: string;
  buttons?: FrameButton[];
  inputText?: string;
  postUrl?: string;
  aspectRatio?: '1.91:1' | '1:1';
  state?: string;
}

export interface FrameButton {
  label: string;
  action: 'post' | 'post_redirect' | 'link' | 'mint';
  target?: string;
  postUrl?: string;
}

export interface FrameRequest {
  untrustedData: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex?: number;
    inputText?: string;
    state?: string;
    transactionId?: string;
    address?: string;
    castId: {
      fid: number;
      hash: string;
    };
  };
  trustedData: {
    messageBytes: string;
  };
}

export interface FrameResponse {
  image: string;
  buttons?: FrameButton[];
  inputText?: string;
  postUrl?: string;
  aspectRatio?: '1.91:1' | '1:1';
  state?: string;
  ogTitle?: string;
  ogDescription?: string;
}

// Cast Creation Types
export interface CreateCastRequest {
  text: string;
  embeds?: Array<{
    url?: string;
    castId?: {
      fid: number;
      hash: string;
    };
  }>;
  channelId?: string;
  parentCastId?: {
    fid: number;
    hash: string;
  };
  signerUuid: string;
}

export interface CreateCastResponse {
  success: boolean;
  cast?: {
    hash: string;
    author: FarcasterUser;
    text: string;
    timestamp: string;
  };
  error?: string;
}

// GIGAVIBE-specific Farcaster Types
export interface GigavibePerformanceCast {
  performance: {
    id: string;
    challengeId: string;
    challengeTitle: string;
    audioUrl: string;
    duration: number;
    selfRating: number;
    communityRating?: number;
    gap?: number;
    viralScore?: number;
    timestamp: Date;
  };
  author: FarcasterUser;
  cast: FarcasterCast;
  coinData?: {
    symbol: string;
    address: string;
    currentPrice: number;
    priceChange24h: number;
    holders: number;
  };
}

export interface GigavibeChallengeInvite {
  challenge: Challenge;
  inviter: FarcasterUser;
  cast: FarcasterCast;
  stats: {
    attempts: number;
    averageRating: number;
    topPerformers: Array<{
      user: FarcasterUser;
      rating: number;
    }>;
  };
}

// Visual Signature Types
export type PerformanceQuality = 'legendary' | 'epic' | 'rare' | 'common';

export interface VisualSignature {
  quality: PerformanceQuality;
  gradient: string;
  icon: string;
  emoji: string;
  glow: string;
  border: string;
  particles: number;
}

export interface RealityGapDisplay {
  gap: number;
  emoji: string;
  label: string;
  color: string;
  description: string;
}

// Component Props Types
export interface FarcasterAudioCardProps {
  performance: GigavibePerformanceCast['performance'];
  author: FarcasterUser;
  variant?: 'cast' | 'frame' | 'compact';
  showCoinData?: boolean;
  showSocialStats?: boolean;
  onPlay?: () => void;
  onOpenInApp?: () => void;
  onTryChallenge?: () => void;
  onTrade?: () => void;
  onLike?: () => void;
  onRecast?: () => void;
  onReply?: () => void;
}

export interface ChallengeFrameProps {
  challenge: Challenge;
  frameRequest?: FrameRequest;
  showStats?: boolean;
  showRecentPerformers?: boolean;
}

export interface PerformanceFrameProps {
  performance: GigavibePerformanceCast['performance'];
  author: FarcasterUser;
  frameRequest?: FrameRequest;
  showRealityCheck?: boolean;
  showCoinData?: boolean;
}

export interface TradingFrameProps {
  coinData: GigavibeChallengeInvite['stats'] & {
    symbol: string;
    address: string;
    currentPrice: number;
    priceChange24h: number;
  };
  frameRequest?: FrameRequest;
}

// Cast Composer Types
export interface CastComposerProps {
  performance?: GigavibePerformanceCast['performance'];
  challenge?: Challenge;
  type: 'performance' | 'challenge_invite' | 'coin_announcement';
  onPublish: (castData: CreateCastRequest) => void;
  onCancel?: () => void;
}

export interface CastTemplate {
  text: string;
  embeds?: Array<{
    url: string;
  }>;
  channelId?: string;
}

// Mini App Types
export interface MiniAppContext {
  isMiniApp: boolean;
  isInFarcaster: boolean;
  parentUrl?: string;
  userFid?: number;
  castHash?: string;
  channelId?: string;
}

export interface MiniAppNavigation {
  canGoBack: boolean;
  parentContext?: 'cast' | 'channel' | 'profile';
  returnUrl?: string;
}

// Analytics Types
export interface FarcasterAnalytics {
  source: 'cast' | 'frame' | 'miniapp' | 'channel';
  action: 'view' | 'play' | 'challenge_start' | 'challenge_complete' | 'trade' | 'share';
  castHash?: string;
  channelId?: string;
  userFid?: number;
  performanceId?: string;
  challengeId?: string;
  timestamp: Date;
}

// API Response Types
export interface FarcasterApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface FrameImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'png' | 'jpg' | 'webp';
  background?: string;
  overlay?: string;
}

// Utility Types
export type FarcasterEventType = 
  | 'cast_created'
  | 'cast_liked' 
  | 'cast_recast'
  | 'cast_replied'
  | 'frame_clicked'
  | 'miniapp_opened'
  | 'challenge_started'
  | 'performance_shared'
  | 'coin_traded';

export interface FarcasterEvent {
  type: FarcasterEventType;
  fid: number;
  castHash?: string;
  data?: Record<string, any>;
  timestamp: Date;
}

// Error Types
export interface FarcasterError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Configuration Types
export interface FarcasterConfig {
  apiKey: string;
  baseUrl: string;
  channelId?: string;
  signerUuid?: string;
  webhookUrl?: string;
}

export interface FrameConfig {
  baseUrl: string;
  imageBaseUrl: string;
  defaultAspectRatio: '1.91:1' | '1:1';
  maxButtons: number;
  maxTextLength: number;
}