import { Address } from 'viem';

export interface RealityCheckResult {
  id: string;
  eventId: string;
  challengeTitle: string;
  challengeId: string;
  userAddress: Address;
  selfRating: number;
  communityRating: number;
  gap: number;
  wittyCommentary: string;
  shareCount: number;
  timestamp: Date;
  audioUrl: string;
  resultImageUrl?: string;
  category: 'quality' | 'legendary' | 'comedy' | 'diva' | 'baritone';
  farcasterData?: {
    castHash: string;
    authorFid: number;
    authorUsername: string;
    authorPfp: string;
    authorDisplayName: string;
    likes: number;
    recasts: number;
    replies: number;
  };
}

export interface PerformanceCoin {
  address: Address;
  name: string;
  symbol: string;
  creator: Address;
  performance: RealityCheckResult;
  marketData: {
    price: number;
    volume24h: number;
    marketCap: number;
    holders: number;
    priceChange24h: number;
    priceChangePercent24h: number;
  };
  metadata: {
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
}

export interface MarketLeaderboards {
  byPrice: PerformanceCoin[];
  byVolume: PerformanceCoin[];
  byHolders: PerformanceCoin[];
  byPriceChange: PerformanceCoin[];
  byMarketCap: PerformanceCoin[];
}

export interface CoinEligibility {
  type: 'leaderboard_winner' | 'viral_moment' | 'perfect_score' | 'reality_gap' | 'meme_worthy' | 'community_nominated';
  performance: RealityCheckResult;
  reason: string;
  autoMint: boolean;
}

export interface TradingMetrics {
  totalVolume: number;
  totalCoins: number;
  topPerformer: PerformanceCoin | null;
  trendingCoins: PerformanceCoin[];
  recentTrades: Array<{
    coinAddress: Address;
    type: 'buy' | 'sell';
    amount: number;
    price: number;
    timestamp: Date;
    trader: Address;
  }>;
}