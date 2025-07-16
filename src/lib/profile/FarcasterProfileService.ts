'use client';

/**
 * Service for fetching and caching Farcaster profile data
 * Handles profile images, usernames, and display names
 */

export interface FarcasterProfile {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  verifiedAddresses?: string[];
}

export class FarcasterProfileService {
  private static instance: FarcasterProfileService;
  private profileCache = new Map<number, FarcasterProfile>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  static getInstance(): FarcasterProfileService {
    if (!FarcasterProfileService.instance) {
      FarcasterProfileService.instance = new FarcasterProfileService();
    }
    return FarcasterProfileService.instance;
  }

  /**
   * Get profile by FID with caching
   */
  async getProfile(fid: number): Promise<FarcasterProfile | null> {
    try {
      // Check cache first
      const cached = this.profileCache.get(fid);
      if (cached && this.isCacheValid(cached)) {
        return cached;
      }

      // Fetch from API
      const response = await fetch(`/api/farcaster/user?fid=${fid}`);
      if (!response.ok) {
        console.warn(`Failed to fetch profile for FID ${fid}:`, response.status);
        return this.getFallbackProfile(fid);
      }

      const data = await response.json();
      const profile = this.transformProfile(data.user || data);
      
      // Cache the result
      this.profileCache.set(fid, { ...profile, _cacheTime: Date.now() } as any);
      
      return profile;
    } catch (error) {
      console.error(`Error fetching profile for FID ${fid}:`, error);
      return this.getFallbackProfile(fid);
    }
  }

  /**
   * Get multiple profiles efficiently
   */
  async getProfiles(fids: number[]): Promise<Map<number, FarcasterProfile>> {
    const results = new Map<number, FarcasterProfile>();
    
    // Separate cached and uncached FIDs
    const uncachedFids: number[] = [];
    
    for (const fid of fids) {
      const cached = this.profileCache.get(fid);
      if (cached && this.isCacheValid(cached)) {
        results.set(fid, cached);
      } else {
        uncachedFids.push(fid);
      }
    }

    // Fetch uncached profiles in parallel
    if (uncachedFids.length > 0) {
      const fetchPromises = uncachedFids.map(fid => this.getProfile(fid));
      const fetchedProfiles = await Promise.all(fetchPromises);
      
      fetchedProfiles.forEach((profile, index) => {
        if (profile) {
          results.set(uncachedFids[index], profile);
        }
      });
    }

    return results;
  }

  /**
   * Transform API response to our profile format
   */
  private transformProfile(userData: any): FarcasterProfile {
    return {
      fid: userData.fid,
      username: userData.username || `user${userData.fid}`,
      displayName: userData.display_name || userData.displayName || userData.username || `User ${userData.fid}`,
      pfpUrl: this.getValidPfpUrl(userData.pfp_url || userData.pfpUrl),
      bio: userData.profile?.bio?.text || userData.bio?.text || '',
      followerCount: userData.follower_count || userData.followerCount || 0,
      followingCount: userData.following_count || userData.followingCount || 0,
      verifiedAddresses: userData.verified_addresses || userData.verifiedAddresses || []
    };
  }

  /**
   * Ensure profile image URL is valid and accessible
   */
  private getValidPfpUrl(pfpUrl?: string): string {
    if (!pfpUrl) {
      return this.getDefaultPfpUrl();
    }

    // Handle IPFS URLs
    if (pfpUrl.startsWith('ipfs://')) {
      return `https://gateway.pinata.cloud/ipfs/${pfpUrl.replace('ipfs://', '')}`;
    }

    // Handle relative URLs
    if (pfpUrl.startsWith('/')) {
      return `https://warpcast.com${pfpUrl}`;
    }

    // Return as-is if it's already a full URL
    if (pfpUrl.startsWith('http')) {
      return pfpUrl;
    }

    // Fallback to default
    return this.getDefaultPfpUrl();
  }

  /**
   * Get default profile image
   */
  private getDefaultPfpUrl(): string {
    return 'https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https%3A%2F%2Flh3.googleusercontent.com%2Fa%2Fdefault-user%3Ds256-c';
  }

  /**
   * Get fallback profile when API fails
   */
  private getFallbackProfile(fid: number): FarcasterProfile {
    return {
      fid,
      username: `user${fid}`,
      displayName: `User ${fid}`,
      pfpUrl: this.getDefaultPfpUrl(),
      bio: '',
      followerCount: 0,
      followingCount: 0
    };
  }

  /**
   * Check if cached profile is still valid
   */
  private isCacheValid(profile: any): boolean {
    return profile._cacheTime && (Date.now() - profile._cacheTime) < this.cacheExpiry;
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.profileCache.clear();
  }

  /**
   * Get cache stats for debugging
   */
  getCacheStats(): { size: number; entries: number[] } {
    return {
      size: this.profileCache.size,
      entries: Array.from(this.profileCache.keys())
    };
  }
}

// Export singleton instance
export const farcasterProfileService = FarcasterProfileService.getInstance();