/**
 * Unified Profile Resolver
 * Combines Web3.bio and ENSData.net for comprehensive profile resolution
 */

import { resolveWeb3Profile, resolveWeb3ProfileBasic, type ResolvedProfile as Web3BioProfile } from './web3bio';
import { resolveENSProfile, resolveENSProfileWithFarcaster, type SimpleProfile as ENSProfile } from './ensdata';

export interface UnifiedProfile {
  address: string;
  displayName: string;
  avatar: string | null;
  description: string | null;
  primaryDomain: string | null;
  links: {
    website?: string;
    github?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    linkedin?: string;
    youtube?: string;
    instagram?: string;
    farcaster?: string;
    lens?: string;
  };
  social?: {
    totalFollowers?: number;
    totalFollowing?: number;
    platforms?: string[];
    farcaster?: {
      username: string;
      displayName: string;
      avatar: string;
      bio: string;
      followers: number;
      following: number;
    };
  };
  source: 'web3bio' | 'ensdata' | 'fallback';
  platforms?: string[];
}

class ProfileResolver {
  /**
   * Resolve a profile using multiple services with fallback
   */
  async resolveProfile(identity: string, options: {
    preferBasic?: boolean;
    includeFarcaster?: boolean;
    timeout?: number;
  } = {}): Promise<UnifiedProfile | null> {
    const { preferBasic = false, includeFarcaster = true, timeout = 5000 } = options;

    try {
      // Try Web3.bio first (more comprehensive)
      const web3bioProfile = await this.withTimeout(
        preferBasic 
          ? resolveWeb3ProfileBasic(identity)
          : resolveWeb3Profile(identity),
        timeout
      );

      if (web3bioProfile) {
        return this.normalizeWeb3BioProfile(web3bioProfile);
      }
    } catch (error) {
      console.warn('Web3.bio resolution failed, trying ENSData:', error);
    }

    try {
      // Fallback to ENSData
      const ensProfile = await this.withTimeout(
        includeFarcaster 
          ? resolveENSProfileWithFarcaster(identity)
          : resolveENSProfile(identity),
        timeout
      );

      if (ensProfile) {
        return this.normalizeENSProfile(ensProfile);
      }
    } catch (error) {
      console.warn('ENSData resolution failed:', error);
    }

    // Final fallback - return basic address info
    if (this.isValidAddress(identity)) {
      return this.createFallbackProfile(identity);
    }

    return null;
  }

  /**
   * Quick resolution for UI components (uses basic endpoints)
   */
  async quickResolve(identity: string): Promise<UnifiedProfile | null> {
    return this.resolveProfile(identity, { 
      preferBasic: true, 
      includeFarcaster: false,
      timeout: 3000 
    });
  }

  /**
   * Batch resolve multiple identities
   */
  async batchResolve(identities: string[], options: {
    preferBasic?: boolean;
    maxConcurrent?: number;
  } = {}): Promise<(UnifiedProfile | null)[]> {
    const { preferBasic = true, maxConcurrent = 5 } = options;
    
    // Process in batches to avoid rate limiting
    const results: (UnifiedProfile | null)[] = [];
    
    for (let i = 0; i < identities.length; i += maxConcurrent) {
      const batch = identities.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(identity => 
        this.resolveProfile(identity, { preferBasic, timeout: 3000 })
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : null
      ));
    }
    
    return results;
  }

  private normalizeWeb3BioProfile(profile: Web3BioProfile): UnifiedProfile {
    const links: UnifiedProfile['links'] = {};
    
    // Convert Web3.bio links format
    if (profile.links.website) links.website = profile.links.website.link;
    if (profile.links.github) links.github = profile.links.github.link;
    if (profile.links.twitter) links.twitter = profile.links.twitter.link;
    if (profile.links.telegram) links.telegram = profile.links.telegram.link;
    if (profile.links.youtube) links.youtube = profile.links.youtube.link;
    if (profile.links.farcaster) links.farcaster = profile.links.farcaster.link;
    if (profile.links.lens) links.lens = profile.links.lens.link;

    return {
      address: profile.address,
      displayName: profile.displayName,
      avatar: profile.avatar,
      description: profile.description,
      primaryDomain: profile.primaryDomain,
      links,
      social: profile.social.totalFollowers > 0 ? {
        totalFollowers: profile.social.totalFollowers,
        totalFollowing: profile.social.totalFollowing,
        platforms: profile.social.platforms
      } : undefined,
      source: 'web3bio',
      platforms: profile.platforms.map(p => p.platform)
    };
  }

  private normalizeENSProfile(profile: ENSProfile): UnifiedProfile {
    return {
      address: profile.address,
      displayName: profile.displayName,
      avatar: profile.avatar,
      description: profile.description,
      primaryDomain: profile.primaryDomain,
      links: profile.links,
      social: profile.farcaster ? {
        farcaster: profile.farcaster
      } : undefined,
      source: 'ensdata',
      platforms: profile.primaryDomain ? ['ens'] : undefined
    };
  }

  private createFallbackProfile(address: string): UnifiedProfile {
    return {
      address,
      displayName: this.formatAddress(address),
      avatar: null,
      description: null,
      primaryDomain: null,
      links: {},
      source: 'fallback'
    };
  }

  private formatAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  private isValidAddress(input: string): boolean {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(input);
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }
}

// Create singleton instance
export const profileResolver = new ProfileResolver();

// Helper functions for common use cases
export async function resolveUserProfile(identity: string): Promise<UnifiedProfile | null> {
  return profileResolver.resolveProfile(identity);
}

export async function quickResolveProfile(identity: string): Promise<UnifiedProfile | null> {
  return profileResolver.quickResolve(identity);
}

export async function batchResolveProfiles(identities: string[]): Promise<(UnifiedProfile | null)[]> {
  return profileResolver.batchResolve(identities);
}