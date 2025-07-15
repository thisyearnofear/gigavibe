/**
 * ENSData.net API Integration
 * Fallback service for ENS text records and profile data
 */

export interface ENSDataProfile {
  address: string;
  name: string | null;
  display_name: string | null;
  avatar: string | null;
  avatar_url: string | null;
  cover: string | null;
  cover_url: string | null;
  description: string | null;
  email: string | null;
  url: string | null;
  location: string | null;
  notice: string | null;
  keywords: string | null;
  discord: string | null;
  github: string | null;
  reddit: string | null;
  twitter: string | null;
  telegram: string | null;
  linkedin: string | null;
  youtube: string | null;
  instagram: string | null;
  snapchat: string | null;
  header: string | null;
  contenthash: string | null;
  fresh: number;
  resolver: string | null;
  errors: any;
  farcaster?: {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    bio: string;
    follower_count: number;
    following_count: number;
    verified: boolean;
  };
  expiry?: {
    date: string;
    timestamp: number;
    expired: boolean;
  };
}

export interface SimpleProfile {
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
  };
  farcaster?: {
    username: string;
    displayName: string;
    avatar: string;
    bio: string;
    followers: number;
    following: number;
  };
}

class ENSDataAPI {
  private baseUrl = 'https://ensdata.net';

  private async makeRequest(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        // Add cache control for better performance
        cache: 'force-cache',
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      if (!response.ok) {
        throw new Error(`ENSData API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ENSData API request failed:', error);
      throw error;
    }
  }

  /**
   * Get ENS profile data for an address or ENS name
   */
  async getProfile(identity: string): Promise<ENSDataProfile> {
    return this.makeRequest(`/${encodeURIComponent(identity)}`);
  }

  /**
   * Get ENS profile with Farcaster data
   */
  async getProfileWithFarcaster(identity: string): Promise<ENSDataProfile> {
    return this.makeRequest(`/${encodeURIComponent(identity)}?farcaster=true`);
  }

  /**
   * Get ENS profile with expiry information
   */
  async getProfileWithExpiry(identity: string): Promise<ENSDataProfile> {
    return this.makeRequest(`/${encodeURIComponent(identity)}?expiry=true`);
  }

  /**
   * Get only the avatar for an identity
   */
  getAvatarUrl(identity: string): string {
    return `${this.baseUrl}/media/avatar/${encodeURIComponent(identity)}`;
  }

  /**
   * Get content hash for an ENS name
   */
  async getContentHash(ensName: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/content-hash/${encodeURIComponent(ensName)}`);
    return response.text();
  }

  /**
   * Resolve an identity to a simple profile format
   */
  async resolveProfile(identity: string, includeFarcaster = false): Promise<SimpleProfile | null> {
    try {
      const profile = includeFarcaster 
        ? await this.getProfileWithFarcaster(identity)
        : await this.getProfile(identity);

      if (!profile || profile.errors) {
        return null;
      }

      // Build links object
      const links: SimpleProfile['links'] = {};
      if (profile.url) links.website = profile.url;
      if (profile.github) links.github = `https://github.com/${profile.github}`;
      if (profile.twitter) links.twitter = `https://twitter.com/${profile.twitter}`;
      if (profile.discord) links.discord = profile.discord;
      if (profile.telegram) links.telegram = `https://t.me/${profile.telegram}`;
      if (profile.linkedin) links.linkedin = `https://linkedin.com/in/${profile.linkedin}`;
      if (profile.youtube) links.youtube = `https://youtube.com/@${profile.youtube}`;
      if (profile.instagram) links.instagram = `https://instagram.com/${profile.instagram}`;

      // Build Farcaster data if available
      let farcasterData: SimpleProfile['farcaster'] | undefined;
      if (profile.farcaster) {
        farcasterData = {
          username: profile.farcaster.username,
          displayName: profile.farcaster.display_name,
          avatar: profile.farcaster.pfp_url,
          bio: profile.farcaster.bio,
          followers: profile.farcaster.follower_count,
          following: profile.farcaster.following_count
        };
      }

      return {
        address: profile.address,
        displayName: profile.display_name || profile.name || this.formatAddress(profile.address),
        avatar: profile.avatar_url || profile.avatar,
        description: profile.description,
        primaryDomain: profile.name,
        links,
        farcaster: farcasterData
      };
    } catch (error) {
      console.error('Failed to resolve ENS profile:', error);
      return null;
    }
  }

  private formatAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
}

// Create singleton instance
export const ensdata = new ENSDataAPI();

// Helper function for quick profile resolution
export async function resolveENSProfile(identity: string): Promise<SimpleProfile | null> {
  return ensdata.resolveProfile(identity);
}

// Helper function for profile resolution with Farcaster data
export async function resolveENSProfileWithFarcaster(identity: string): Promise<SimpleProfile | null> {
  return ensdata.resolveProfile(identity, true);
}

// Helper function to get just the avatar URL
export function getENSAvatarUrl(identity: string): string {
  return ensdata.getAvatarUrl(identity);
}