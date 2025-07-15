# 🏗 GIGAVIBE: Technical Architecture and Strategy

## 🎯 Strategic Decision: Farcaster as Social Database

GIGAVIBE leverages the Farcaster protocol as a decentralized social database, eliminating infrastructure complexity while providing built-in viral mechanics and real user identity. This approach transforms GIGAVIBE into a native Farcaster protocol application, ensuring a truly Web3-native and socially composable platform.

## 📡 Data Architecture

### Farcaster Casts as Data Structures

- **Performance Upload**: Casts in the /gigavibe channel with embedded IPFS links for audio and metadata, and deep links to the app.
  ```typescript
  const performanceCast = {
    text: "🎤 Reality Check: I thought 5⭐... they said 2⭐ 😅 #GigaVibe",
    embeds: [
      { url: "ipfs://audio-file-hash" }, // Audio file
      { url: "ipfs://metadata-hash" }, // Structured metadata
      { url: "https://gigavibe.app/perf/123" }, // Deep link
    ],
    channel: "gigavibe",
  };
  ```
- **Community Voting**: Reply casts with structured ratings linked to the original performance.
  ```typescript
  const voteCast = {
    text: "Rating: 3⭐ #GigaVibe",
    parent: performanceCastHash,
    channel: "gigavibe",
  };
  ```
- **Coin Creation Announcement**: Announcements of viral performances becoming tradeable coins on Zora.
  ```typescript
  const coinCast = {
    text: "🪙 NEW COIN: This performance just went viral! Now tradeable on @zora",
    embeds: [
      { url: "https://zora.co/collect/base/coin-address" },
      { url: "ipfs://community-card-image" },
    ],
    parent: originalPerformanceCast,
    channel: "gigavibe",
  };
  ```

### Data Queries Using Neynar API

GIGAVIBE leverages the Neynar Node.js SDK v3.22.0 through server-side API routes for all Farcaster operations:

  ```typescript
  // Get recent performances from /gigavibe channel
  const channelResponse = await fetch('/api/farcaster/cast?action=fetchChannel&channelId=gigavibe');
  const { casts: performances } = await channelResponse.json();

  // Get community votes for a performance (via replies)
  const votesResponse = await fetch(`/api/farcaster/replies?castHash=${performanceCastHash}`);
  const { casts: allReplies } = await votesResponse.json();
  const votes = allReplies.filter(cast => cast.text.includes('Rating:') && cast.text.includes('⭐'));

  // Search performances by text
  const searchResponse = await fetch('/api/farcaster/cast?action=searchCasts&query=reality check');
  const { casts: searchResults } = await searchResponse.json();

  // Get user profile data
  const userResponse = await fetch(`/api/farcaster/user?action=fetchUserProfile&fid=${fid}`);
  const userProfile = await userResponse.json();
  ```

## 📊 Benefits of Farcaster-Native Approach

- **Hybrid Infrastructure**: Farcaster for social data and interactions, Supabase for supplemental data storage.
- **Built-in Social Features**: Real user profiles, follow relationships, native sharing, and notifications.
- **Viral Mechanics**: Farcaster algorithm for content surfacing, recasts for sharing, trending feeds, and cross-app composability.
- **Real Identity**: Verified users, established reputation systems, social proof, and minimal bot issues.
- **Mobile Integration**: Native Warpcast support, push notifications, mobile-first UX, and cross-platform compatibility.

## 🎭 Post-Submission Flow: Four-Tab Integration Strategy

GIGAVIBE's post-submission experience orchestrates users through all four tabs using Farcaster primitives:

### **Phase 1: Cast Creation (Sing Tab)**
- Performance upload to Grove storage (`lens://` URIs)
- Cast creation in `/gigavibe` channel with audio embeds
- Immediate navigation to Discovery tab with cast highlighting

### **Phase 2: Channel Discovery (Discover Tab)**  
- Channel-aware feed using Neynar `fetchChannel` API
- Real-time cast highlighting for user's new performance
- Cross-tab navigation to encourage voting participation

### **Phase 3: Reply-Based Voting (Judge Tab)**
- Community voting via cast replies with structured ratings
- Gamified voting progress to unlock user's own performance rating
- Real-time vote tracking using Neynar replies API

### **Phase 4: Viral Metrics Tracking (Market Tab)**
- Cast performance monitoring (likes, recasts, replies)
- Viral threshold detection for coin creation
- Community ownership breakdown based on voting participation

### **Implementation Strategy**
- **Leverage Existing Neynar Routes**: Use established `/api/farcaster/*` endpoints
- **Channel-Centric Architecture**: Focus on `/gigavibe` channel as primary data source  
- **Reply-Based Voting**: Parse reply text for rating extraction and progress tracking
- **Cross-Tab State Management**: Shared context for seamless navigation with cast data

## 🔧 Technical Implementation Details

- **FarcasterDataService**: Manages performance creation, retrieval, voting, and search functionalities.

  ```typescript
  class FarcasterDataService {
    // Upload performance to Farcaster via Neynar API
    async createPerformance(audioIPFS: string, metadata: any): Promise<string> {
      const response = await fetch('/api/farcaster/cast', {
        method: 'POST',
        body: JSON.stringify({
          action: 'publishCast',
          signerUuid: metadata.signerUuid,
          text: `🎤 Reality Check: "${metadata.challengeTitle}" - I thought ${metadata.selfRating}⭐ #GigaVibe`,
          embeds: [{ url: audioIPFS }, { url: `https://gigavibe.app/performance/${metadata.id}` }],
          channelId: 'gigavibe'
        })
      });
      const { cast } = await response.json();
      return cast.hash;
    }

    // Get performances from /gigavibe channel
    async getPerformances(limit: number = 50): Promise<Performance[]> {
      const response = await fetch(`/api/farcaster/cast?action=fetchChannel&channelId=gigavibe`);
      const { casts } = await response.json();
      return casts.slice(0, limit).map(this.transformCastToPerformance);
    }

    // Submit community vote as reply
    async submitVote(performanceHash: string, rating: number): Promise<string> {
      const response = await fetch('/api/farcaster/cast', {
        method: 'POST',
        body: JSON.stringify({
          action: 'publishCast',
          text: `Rating: ${rating}⭐ #GigaVibe`,
          parent: performanceHash,
          channelId: 'gigavibe'
        })
      });
      const { cast } = await response.json();
      return cast.hash;
    }

    // Get votes for performance via replies
    async getVotes(performanceHash: string): Promise<Vote[]> {
      const response = await fetch(`/api/farcaster/replies?castHash=${performanceHash}`);
      const { casts } = await response.json();
      return casts.filter(cast => cast.text.includes('Rating:') && cast.text.includes('⭐'))
                  .map(this.transformReplyToVote);
    }

    // Search performances in channel
    async searchPerformances(query: string): Promise<Performance[]> {
      const response = await fetch(`/api/farcaster/cast?action=searchCasts&query=${query}`);
      const { casts } = await response.json();
      return casts.filter(cast => cast.channel?.id === 'gigavibe')
                  .map(this.transformCastToPerformance);
    }
  }
  ```

- **Data Flow**: Audio recording to IPFS upload, metadata creation, Farcaster posting, community engagement, viral detection, and coin creation announcements.

## 📦 Supabase Database Architecture

GIGAVIBE uses a Supabase PostgreSQL database to complement Farcaster's social data, providing persistent storage for data not natively handled by Farcaster or Zora protocols.

### Schema Design

```sql
-- Core tables for user data and performances
CREATE TABLE users (
  id UUID PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  farcaster_fid INTEGER UNIQUE,
  display_name TEXT,
  pfp_url TEXT
);

CREATE TABLE performances (
  id UUID PRIMARY KEY,
  farcaster_cast_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  title TEXT,
  audio_url TEXT,
  audio_duration REAL
);

-- Supporting tables for analytics, viral detection, and notifications
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY,
  performance_id UUID REFERENCES performances(id),
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  recasts_count INTEGER DEFAULT 0
);

CREATE TABLE viral_queue (
  id UUID PRIMARY KEY,
  performance_id UUID REFERENCES performances(id),
  detection_score REAL NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  performance_id UUID REFERENCES performances(id),
  event_data JSONB
);
```

### DatabaseService Implementation

```typescript
class DatabaseService {
  // User methods
  async getUserByWallet(walletAddress: string): Promise<User | null>;
  async createOrUpdateUser(user: Partial<User>): Promise<User | null>;

  // Performance methods
  async getPerformanceById(id: string): Promise<Performance | null>;
  async getRecentPerformances(limit: number): Promise<Performance[]>;

  // Analytics methods
  async trackEvent(event: Partial<AnalyticsEvent>): Promise<void>;

  // Viral detection methods
  async getViralThresholds(): Promise<ViralThreshold[]>;
  async addToViralQueue(
    queueItem: Partial<ViralQueueItem>
  ): Promise<ViralQueueItem | null>;

  // Notification methods
  async createNotification(
    notification: Partial<Notification>
  ): Promise<Notification | null>;
}
```

### Row-Level Security

The database implements Row-Level Security (RLS) policies to ensure data access control:

```sql
-- Basic RLS policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (wallet_address = auth.jwt() ->> 'sub');

-- Only admins can view/modify viral queue
CREATE POLICY "Admins can manage viral queue" ON viral_queue USING (auth.jwt() ->> 'role' = 'service_role');

-- Analytics policies
CREATE POLICY "Anyone can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view analytics" ON analytics_events FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');
```

## 🌐 Dual Access Strategy: MiniKit vs SIWN

GIGAVIBE supports two access patterns optimized for different contexts:

### MiniKit Access (Farcaster Mini App)

- **Context**: Users access via Warpcast or other Farcaster clients.
- **Authentication**: Automatic, as users are already authenticated within the client.
- **Advantages**: Zero friction, native integration, instant access, and viral distribution within Farcaster.
- **Limitations**: Limited scope, dependency on client support, and reduced feature set.
- **Implementation**:
  ```typescript
  import { useMiniKit } from "@/providers/MiniKitProvider";
  const { user, isConnected } = useMiniKit();
  ```

### SIWN Access (Standalone Web App)

- **Context**: Direct web access from any browser or device.
- **Authentication**: Explicit "Sign in with Farcaster" flow requiring permission grants.
- **Advantages**: Full features, universal access, bookmarkable, SEO friendly, and rich UI.
- **Limitations**: Authentication required, additional state management complexity.
- **Implementation**:
  ```typescript
  import { useFarcasterAuth } from "@/contexts/FarcasterAuthContext";
  import SIWNButton from "@/components/auth/SIWNButton";
  const { isAuthenticated, user, signIn } = useFarcasterAuth();
  <SIWNButton onSuccess={signIn} />;
  ```

### Hybrid Strategy

- **Unified Authentication Detection**: Automatically detects context to provide the appropriate experience.
- **Context-Aware Features**: MiniKit for quick interactions, Web App for full recording and trading capabilities.
- **Shared Infrastructure**: Farcaster protocol for data, IPFS for storage, Zora for trading, ensuring consistency across contexts.

## 🎯 Strategic Benefits

- **Decentralized by Design**: No single point of failure, censorship resistant, user-owned data, and permissionless innovation.
- **Social-First Architecture**: Built-in network effects, real user engagement, authentic viral mechanics, and cross-platform reach.
- **Maximum Reach and User Acquisition**: Leveraging Farcaster's user base and universal web access for broad engagement and retention.
- **Technical Excellence**: Protocol-first design, context-aware experiences, unified backend services, and future-proof architecture for Farcaster innovations.

This document outlines GIGAVIBE's technical foundation and strategic approach to leveraging decentralized protocols like Farcaster and IPFS, ensuring a scalable, engaging, and community-driven platform.
