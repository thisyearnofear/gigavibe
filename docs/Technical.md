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

- Fetching recent performances, community votes, user performance history, and search functionalities through the Neynar API.

  ```typescript
  // Get recent performances
  const performances = await neynar.fetchCastsInChannel("gigavibe", {
    limit: 50,
    hasEmbeds: true, // Only casts with audio/metadata
  });

  // Get community votes for a performance
  const votes = await neynar.fetchCastReplies(performanceCastHash, {
    limit: 100,
  });

  // Get user's performance history
  const userPerformances = await neynar.fetchCastsForUser(fid, {
    channel: "gigavibe",
  });

  // Search performances by text
  const searchResults = await neynar.searchCasts({
    q: "reality check",
    channel: "gigavibe",
  });
  ```

## 📊 Benefits of Farcaster-Native Approach

- **Hybrid Infrastructure**: Farcaster for social data and interactions, Supabase for supplemental data storage.
- **Built-in Social Features**: Real user profiles, follow relationships, native sharing, and notifications.
- **Viral Mechanics**: Farcaster algorithm for content surfacing, recasts for sharing, trending feeds, and cross-app composability.
- **Real Identity**: Verified users, established reputation systems, social proof, and minimal bot issues.
- **Mobile Integration**: Native Warpcast support, push notifications, mobile-first UX, and cross-platform compatibility.

## 🎭 Implementation Strategy for Farcaster Integration

- **Phase 1: Core Integration**: Performance uploads as casts, community voting via replies, discovery feed from channel queries, and user profile integration.
- **Phase 2: Enhanced Metadata**: Rich IPFS metadata, community cards, performance analytics, and viral detection.
- **Phase 3: Advanced Features**: Cross-app integration, composable social features, real-time updates via hub subscriptions, and custom indexing for complex queries.
- **Phase 4: Social Optimization**: Weekly challenge rituals, enhanced identity expression, viral loop amplification, and habit formation triggers.

## 🔧 Technical Implementation Details

- **FarcasterDataService**: Manages performance creation, retrieval, voting, and search functionalities.

  ```typescript
  class FarcasterDataService {
    // Upload performance to Farcaster
    async createPerformance(audioIPFS: string, metadata: any): Promise<string>;

    // Get performances from channel
    async getPerformances(
      limit: number,
      cursor?: string
    ): Promise<Performance[]>;

    // Submit community vote
    async submitVote(performanceHash: string, rating: number): Promise<string>;

    // Get votes for performance
    async getVotes(performanceHash: string): Promise<Vote[]>;

    // Search performances
    async searchPerformances(query: string): Promise<Performance[]>;
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
