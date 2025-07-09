'use client';

import { Address } from 'viem';
import { RealityCheckResult } from '@/lib/zora/types';

export interface CommunityContribution {
  userAddress: Address;
  contributionType: 'voter' | 'cover_artist' | 'sharer' | 'original_performer';
  timestamp: Date;
  metadata?: {
    rating?: number;
    coverPerformanceId?: string;
    shareCount?: number;
  };
}

export interface CommunityOwnership {
  performanceId: string;
  totalContributions: number;
  allocations: {
    originalPerformer: { address: Address; percentage: number };
    voters: Array<{ address: Address; percentage: number; rating: number }>;
    coverArtists: Array<{ address: Address; percentage: number; coverPerformanceId: string }>;
    sharers: Array<{ address: Address; percentage: number; shareCount: number }>;
  };
  eligibleForCoin: boolean;
  coinAddress?: Address;
}

/**
 * Service for managing community ownership of viral performances
 * Tracks contributions and calculates allocations for coin creation
 */
export class CommunityOwnershipService {
  private static instance: CommunityOwnershipService;
  private contributions: Map<string, CommunityContribution[]> = new Map();
  private ownerships: Map<string, CommunityOwnership> = new Map();
  private apiEndpoint = process.env.NEXT_PUBLIC_API_URL || 'https://api.gigavibe.xyz';

  // Allocation percentages
  private readonly ALLOCATION_RULES = {
    ORIGINAL_PERFORMER: 0.60, // 60%
    VOTERS: 0.25,             // 25%
    COVER_ARTISTS: 0.10,      // 10%
    SHARERS: 0.05             // 5%
  };

  // Minimum thresholds for coin creation
  private readonly COIN_THRESHOLDS = {
    MIN_VOTERS: 10,
    MIN_SHARES: 50,
    MIN_COVERS: 3,
    MIN_TOTAL_ENGAGEMENT: 100
  };

  constructor() {}

  static getInstance(): CommunityOwnershipService {
    if (!CommunityOwnershipService.instance) {
      CommunityOwnershipService.instance = new CommunityOwnershipService();
    }
    return CommunityOwnershipService.instance;
  }

  /**
   * Record a community contribution
   */
  async recordContribution(
    performanceId: string,
    contribution: CommunityContribution
  ): Promise<void> {
    try {
      // Send contribution to API
      const response = await fetch(`${this.apiEndpoint}/api/community/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performanceId,
          contribution
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to record contribution: ${response.status}`);
      }

      // Get updated contributions from API
      const result = await response.json();
      
      // Update local cache
      const existing = this.contributions.get(performanceId) || [];
      const existingContribution = existing.find(
        c => c.userAddress === contribution.userAddress &&
             c.contributionType === contribution.contributionType
      );

      if (existingContribution) {
        existingContribution.metadata = contribution.metadata;
        existingContribution.timestamp = contribution.timestamp;
      } else {
        existing.push(contribution);
      }

      this.contributions.set(performanceId, existing);
      
      // Recalculate ownership
      await this.calculateOwnership(performanceId);
      
      console.log(`Recorded ${contribution.contributionType} contribution for performance ${performanceId}`);
    } catch (error) {
      console.error('Failed to record contribution:', error);
    }
  }

  /**
   * Calculate community ownership for a performance
   */
  private async calculateOwnership(performanceId: string): Promise<void> {
    const contributions = this.contributions.get(performanceId) || [];
    
    // Separate contributions by type
    const originalPerformer = contributions.find(c => c.contributionType === 'original_performer');
    const voters = contributions.filter(c => c.contributionType === 'voter');
    const coverArtists = contributions.filter(c => c.contributionType === 'cover_artist');
    const sharers = contributions.filter(c => c.contributionType === 'sharer');

    if (!originalPerformer) {
      console.warn(`No original performer found for performance ${performanceId}`);
      return;
    }

    // Calculate allocations
    const ownership: CommunityOwnership = {
      performanceId,
      totalContributions: contributions.length,
      allocations: {
        originalPerformer: {
          address: originalPerformer.userAddress,
          percentage: this.ALLOCATION_RULES.ORIGINAL_PERFORMER
        },
        voters: this.calculateVoterAllocations(voters),
        coverArtists: this.calculateCoverArtistAllocations(coverArtists),
        sharers: this.calculateSharerAllocations(sharers)
      },
      eligibleForCoin: this.checkCoinEligibility(contributions)
    };

    this.ownerships.set(performanceId, ownership);
    
    // Check if should trigger coin creation
    if (ownership.eligibleForCoin && !ownership.coinAddress) {
      await this.triggerCoinCreation(performanceId);
    }
  }

  /**
   * Calculate voter allocations based on rating quality
   */
  private calculateVoterAllocations(voters: CommunityContribution[]): Array<{ address: Address; percentage: number; rating: number }> {
    if (voters.length === 0) return [];

    const totalVoterAllocation = this.ALLOCATION_RULES.VOTERS;
    const baseAllocation = totalVoterAllocation / voters.length;

    return voters.map(voter => ({
      address: voter.userAddress,
      percentage: baseAllocation,
      rating: voter.metadata?.rating || 0
    }));
  }

  /**
   * Calculate cover artist allocations
   */
  private calculateCoverArtistAllocations(coverArtists: CommunityContribution[]): Array<{ address: Address; percentage: number; coverPerformanceId: string }> {
    if (coverArtists.length === 0) return [];

    const totalCoverAllocation = this.ALLOCATION_RULES.COVER_ARTISTS;
    const baseAllocation = totalCoverAllocation / coverArtists.length;

    return coverArtists.map(artist => ({
      address: artist.userAddress,
      percentage: baseAllocation,
      coverPerformanceId: artist.metadata?.coverPerformanceId || ''
    }));
  }

  /**
   * Calculate sharer allocations based on share count
   */
  private calculateSharerAllocations(sharers: CommunityContribution[]): Array<{ address: Address; percentage: number; shareCount: number }> {
    if (sharers.length === 0) return [];

    const totalSharerAllocation = this.ALLOCATION_RULES.SHARERS;
    const totalShares = sharers.reduce((sum, sharer) => sum + (sharer.metadata?.shareCount || 1), 0);

    return sharers.map(sharer => {
      const shareCount = sharer.metadata?.shareCount || 1;
      const percentage = (shareCount / totalShares) * totalSharerAllocation;
      
      return {
        address: sharer.userAddress,
        percentage,
        shareCount
      };
    });
  }

  /**
   * Check if performance is eligible for coin creation
   */
  private checkCoinEligibility(contributions: CommunityContribution[]): boolean {
    const voters = contributions.filter(c => c.contributionType === 'voter');
    const covers = contributions.filter(c => c.contributionType === 'cover_artist');
    const sharers = contributions.filter(c => c.contributionType === 'sharer');
    
    const totalShares = sharers.reduce((sum, s) => sum + (s.metadata?.shareCount || 1), 0);
    const totalEngagement = voters.length + covers.length + totalShares;

    return (
      voters.length >= this.COIN_THRESHOLDS.MIN_VOTERS &&
      totalShares >= this.COIN_THRESHOLDS.MIN_SHARES &&
      covers.length >= this.COIN_THRESHOLDS.MIN_COVERS &&
      totalEngagement >= this.COIN_THRESHOLDS.MIN_TOTAL_ENGAGEMENT
    );
  }

  /**
   * Trigger coin creation for eligible performance
   */
  private async triggerCoinCreation(performanceId: string): Promise<void> {
    try {
      console.log(`🎯 Triggering coin creation for performance ${performanceId}`);
      
      const ownership = this.ownerships.get(performanceId);
      if (!ownership) {
        throw new Error(`No ownership data found for performance ${performanceId}`);
      }
      
      // Send request to API to create the coin
      const response = await fetch(`${this.apiEndpoint}/api/community/create-coin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performanceId,
          ownership
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create coin: ${response.status}`);
      }

      const result = await response.json();
      
      // Update local cache with coin address
      if (result.coinAddress) {
        const updatedOwnership = { ...ownership, coinAddress: result.coinAddress };
        this.ownerships.set(performanceId, updatedOwnership);
      }
      
      console.log('Community Ownership Summary:', {
        totalContributions: ownership.totalContributions,
        voters: ownership.allocations.voters.length,
        covers: ownership.allocations.coverArtists.length,
        sharers: ownership.allocations.sharers.length,
        coinAddress: result.coinAddress || 'pending'
      });
    } catch (error) {
      console.error('Failed to trigger coin creation:', error);
    }
  }

  /**
   * Get community ownership for a performance
   */
  async getCommunityOwnership(performanceId: string): Promise<CommunityOwnership | null> {
    try {
      // Try to get from cache first
      const cachedOwnership = this.ownerships.get(performanceId);
      if (cachedOwnership) {
        return cachedOwnership;
      }
      
      // If not in cache, fetch from API
      const response = await fetch(`${this.apiEndpoint}/api/community/ownership/${performanceId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get ownership: ${response.status}`);
      }
      
      const ownership = await response.json();
      
      // Update cache
      this.ownerships.set(performanceId, ownership);
      
      return ownership;
    } catch (error) {
      console.error(`Error fetching community ownership for ${performanceId}:`, error);
      return null;
    }
  }

  /**
   * Get all contributions for a performance
   */
  async getContributions(performanceId: string): Promise<CommunityContribution[]> {
    try {
      // Try to get from cache first
      const cachedContributions = this.contributions.get(performanceId);
      if (cachedContributions) {
        return cachedContributions;
      }
      
      // If not in cache, fetch from API
      const response = await fetch(`${this.apiEndpoint}/api/community/contributions/${performanceId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get contributions: ${response.status}`);
      }
      
      const contributions = await response.json();
      
      // Update cache
      this.contributions.set(performanceId, contributions);
      
      return contributions;
    } catch (error) {
      console.error(`Error fetching contributions for ${performanceId}:`, error);
      return [];
    }
  }

  /**
   * Get user's contributions across all performances
   */
  async getUserContributions(userAddress: Address): Promise<Array<{ performanceId: string; contribution: CommunityContribution }>> {
    try {
      // Fetch from API
      const response = await fetch(`${this.apiEndpoint}/api/community/user-contributions/${userAddress}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get user contributions: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching contributions for user ${userAddress}:`, error);
      
      // Fall back to local cache as backup
      const userContributions: Array<{ performanceId: string; contribution: CommunityContribution }> = [];
      
      for (const [performanceId, contributions] of this.contributions.entries()) {
        const userContribs = contributions.filter(c => c.userAddress === userAddress);
        userContribs.forEach(contribution => {
          userContributions.push({ performanceId, contribution });
        });
      }
      
      return userContributions;
    }
  }

  /**
   * Get user's potential earnings from all owned coins
   */
  async getUserPortfolioValue(userAddress: Address): Promise<{
    totalValue: number;
    ownedCoins: Array<{
      performanceId: string;
      percentage: number;
      contributionType: string;
      estimatedValue: number;
    }>;
  }> {
    try {
      // Fetch portfolio value from API
      const response = await fetch(`${this.apiEndpoint}/api/community/portfolio/${userAddress}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get portfolio: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching portfolio for user ${userAddress}:`, error);
      
      // Fall back to local calculation as backup
      const userContributions = await this.getUserContributions(userAddress);
      const ownedCoins = [];
      let totalValue = 0;

      for (const { performanceId, contribution } of userContributions) {
        const ownership = await this.getCommunityOwnership(performanceId);
        if (ownership && ownership.coinAddress) {
          // Find user's allocation
          let userPercentage = 0;
          const contributionType = contribution.contributionType;

          if (contribution.contributionType === 'original_performer') {
            userPercentage = ownership.allocations.originalPerformer.percentage;
          } else if (contribution.contributionType === 'voter') {
            const voterAlloc = ownership.allocations.voters.find(v => v.address === userAddress);
            userPercentage = voterAlloc?.percentage || 0;
          } else if (contribution.contributionType === 'cover_artist') {
            const coverAlloc = ownership.allocations.coverArtists.find(c => c.address === userAddress);
            userPercentage = coverAlloc?.percentage || 0;
          } else if (contribution.contributionType === 'sharer') {
            const sharerAlloc = ownership.allocations.sharers.find(s => s.address === userAddress);
            userPercentage = sharerAlloc?.percentage || 0;
          }

          // Get real coin value from market API
          let estimatedCoinValue = 0.1; // Default fallback value
          try {
            const marketResponse = await fetch(`${this.apiEndpoint}/api/market/coin-value/${ownership.coinAddress}`);
            if (marketResponse.ok) {
              const marketData = await marketResponse.json();
              estimatedCoinValue = marketData.value;
            }
          } catch (marketError) {
            console.error(`Error fetching market value for coin ${ownership.coinAddress}:`, marketError);
          }
          
          const estimatedValue = estimatedCoinValue * userPercentage;

          ownedCoins.push({
            performanceId,
            percentage: userPercentage,
            contributionType,
            estimatedValue
          });

          totalValue += estimatedValue;
        }
      }

      return { totalValue, ownedCoins };
    }
  }
}