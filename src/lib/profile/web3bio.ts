/**
 * Web3.bio Profile API Integration
 * Universal Identity & Domain Resolver for Ethereum, ENS, Farcaster, Lens, and Solana
 */

export interface Web3BioProfile {
  address: string;
  identity: string;
  platform: 'ens' | 'farcaster' | 'lens' | 'basenames' | 'linea' | 'unstoppabledomains' | 'sns';
  displayName: string;
  avatar: string | null;
  description: string | null;
  status: string | null;
  email: string | null;
  location: string | null;
  header: string | null;
  contenthash: string | null;
  links: {
    website?: { link: string; handle: string; sources: string[] };
    github?: { link: string; handle: string; sources: string[] };
    twitter?: { link: string; handle: string; sources: string[] };
    farcaster?: { link: string; handle: string; sources: string[] };
    lens?: { link: string; handle: string; sources: string[] };
    telegram?: { link: string; handle: string; sources: string[] };
    youtube?: { link: string; handle: string; sources: string[] };
  };
  social: {
    uid?: string | number | null;
    follower?: number;
    following?: number;
  };
}

export interface ResolvedProfile {
  address: string;
  displayName: string;
  avatar: string | null;
  description: string | null;
  primaryDomain: string | null;
  platforms: Web3BioProfile[];
  links: Web3BioProfile['links'];
  social: {
    totalFollowers: number;
    totalFollowing: number;
    platforms: string[];
  };
}

class Web3BioAPI {
  private baseUrl = 'https://api.web3.bio';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-KEY'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers,
        // Add cache control for better performance
        cache: 'force-cache',
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      if (!response.ok) {
        throw new Error(`Web3.bio API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Web3.bio API request failed:', error);
      throw error;
    }
  }

  /**
   * Get universal profiles for an identity (address, ENS, etc.)
   */
  async getUniversalProfile(identity: string): Promise<Web3BioProfile[]> {
    return this.makeRequest(`/profile/${encodeURIComponent(identity)}`);
  }

  /**
   * Get basic name service profile (lighter response)
   */
  async getNameServiceProfile(identity: string): Promise<Web3BioProfile[]> {
    return this.makeRequest(`/ns/${encodeURIComponent(identity)}`);
  }

  /**
   * Get platform-specific profile
   */
  async getPlatformProfile(platform: string, identity: string): Promise<Web3BioProfile> {
    return this.makeRequest(`/profile/${platform}/${encodeURIComponent(identity)}`);
  }

  /**
   * Resolve an identity to a comprehensive profile
   */
  async resolveProfile(identity: string, preferBasic = false): Promise<ResolvedProfile | null> {
    try {
      const profiles = preferBasic 
        ? await this.getNameServiceProfile(identity)
        : await this.getUniversalProfile(identity);

      if (!profiles || profiles.length === 0) {
        return null;
      }

      // Find the best primary profile (ENS first, then others)
      const primaryProfile = this.findPrimaryProfile(profiles);
      
      // Aggregate social data
      const socialData = this.aggregateSocialData(profiles);
      
      // Merge links from all platforms
      const mergedLinks = this.mergeLinks(profiles);

      return {
        address: primaryProfile.address,
        displayName: primaryProfile.displayName || this.formatAddress(primaryProfile.address),
        avatar: primaryProfile.avatar,
        description: primaryProfile.description,
        primaryDomain: primaryProfile.identity !== primaryProfile.address ? primaryProfile.identity : null,
        platforms: profiles,
        links: mergedLinks,
        social: socialData
      };
    } catch (error) {
      console.error('Failed to resolve profile:', error);
      return null;
    }
  }

  private findPrimaryProfile(profiles: Web3BioProfile[]): Web3BioProfile {
    // Priority order: ENS > Basenames > Farcaster > Lens > others
    const priorityOrder = ['ens', 'basenames', 'farcaster', 'lens', 'linea', 'unstoppabledomains', 'sns'];
    
    for (const platform of priorityOrder) {
      const profile = profiles.find(p => p.platform === platform);
      if (profile) return profile;
    }
    
    return profiles[0]; // Fallback to first profile
  }

  private aggregateSocialData(profiles: Web3BioProfile[]) {
    let totalFollowers = 0;
    let totalFollowing = 0;
    const platforms: string[] = [];

    profiles.forEach(profile => {
      if (profile.social?.follower) {
        totalFollowers += profile.social.follower;
      }
      if (profile.social?.following) {
        totalFollowing += profile.social.following;
      }
      if (profile.social?.follower || profile.social?.following) {
        platforms.push(profile.platform);
      }
    });

    return {
      totalFollowers,
      totalFollowing,
      platforms
    };
  }

  private mergeLinks(profiles: Web3BioProfile[]): Web3BioProfile['links'] {
    const mergedLinks: Web3BioProfile['links'] = {};
    
    profiles.forEach(profile => {
      if (profile.links) {
        Object.entries(profile.links).forEach(([key, value]) => {
          if (value && !mergedLinks[key as keyof Web3BioProfile['links']]) {
            mergedLinks[key as keyof Web3BioProfile['links']] = value;
          }
        });
      }
    });

    return mergedLinks;
  }

  private formatAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
}

// Create singleton instance
export const web3bio = new Web3BioAPI();

// Helper function for quick profile resolution
export async function resolveWeb3Profile(identity: string): Promise<ResolvedProfile | null> {
  return web3bio.resolveProfile(identity);
}

// Helper function for basic profile resolution (faster)
export async function resolveWeb3ProfileBasic(identity: string): Promise<ResolvedProfile | null> {
  return web3bio.resolveProfile(identity, true);
}