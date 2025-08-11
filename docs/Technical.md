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
const channelResponse = await fetch(
  "/api/farcaster/cast?action=fetchChannel&channelId=gigavibe"
);
const { casts: performances } = await channelResponse.json();

// Get community votes for a performance (via replies)
const votesResponse = await fetch(
  `/api/farcaster/replies?castHash=${performanceCastHash}`
);
const { casts: allReplies } = await votesResponse.json();
const votes = allReplies.filter(
  (cast) => cast.text.includes("Rating:") && cast.text.includes("⭐")
);

// Search performances by text
const searchResponse = await fetch(
  "/api/farcaster/cast?action=searchCasts&query=reality check"
);
const { casts: searchResults } = await searchResponse.json();

// Get user profile data
const userResponse = await fetch(
  `/api/farcaster/user?action=fetchUserProfile&fid=${fid}`
);
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
      const response = await fetch("/api/farcaster/cast", {
        method: "POST",
        body: JSON.stringify({
          action: "publishCast",
          signerUuid: metadata.signerUuid,
          text: `🎤 Reality Check: "${metadata.challengeTitle}" - I thought ${metadata.selfRating}⭐ #GigaVibe`,
          embeds: [
            { url: audioIPFS },
            { url: `https://gigavibe.app/performance/${metadata.id}` },
          ],
          channelId: "gigavibe",
        }),
      });
      const { cast } = await response.json();
      return cast.hash;
    }

    // Get performances from /gigavibe channel
    async getPerformances(limit: number = 50): Promise<Performance[]> {
      const response = await fetch(
        `/api/farcaster/cast?action=fetchChannel&channelId=gigavibe`
      );
      const { casts } = await response.json();
      return casts.slice(0, limit).map(this.transformCastToPerformance);
    }

    // Submit community vote as reply
    async submitVote(performanceHash: string, rating: number): Promise<string> {
      const response = await fetch("/api/farcaster/cast", {
        method: "POST",
        body: JSON.stringify({
          action: "publishCast",
          text: `Rating: ${rating}⭐ #GigaVibe`,
          parent: performanceHash,
          channelId: "gigavibe",
        }),
      });
      const { cast } = await response.json();
      return cast.hash;
    }

    // Get votes for performance via replies
    async getVotes(performanceHash: string): Promise<Vote[]> {
      const response = await fetch(
        `/api/farcaster/replies?castHash=${performanceHash}`
      );
      const { casts } = await response.json();
      return casts
        .filter(
          (cast) => cast.text.includes("Rating:") && cast.text.includes("⭐")
        )
        .map(this.transformReplyToVote);
    }

    // Search performances in channel
    async searchPerformances(query: string): Promise<Performance[]> {
      const response = await fetch(
        `/api/farcaster/cast?action=searchCasts&query=${query}`
      );
      const { casts } = await response.json();
      return casts
        .filter((cast) => cast.channel?.id === "gigavibe")
        .map(this.transformCastToPerformance);
    }
  }
  ```

- **Data Flow**: Audio recording to IPFS upload, metadata creation, Farcaster posting, community engagement, viral detection, and coin creation announcements.

## 📦 Hybrid Database-Blockchain Architecture

GIGAVIBE uses a **hybrid architecture** combining Supabase PostgreSQL database with blockchain protocols (Zora/Base) to optimize for both performance and decentralization.

### Data Responsibility Matrix

| Data Type         | Database (Supabase) | Blockchain (Zora/Base) | Reason                     |
| ----------------- | ------------------- | ---------------------- | -------------------------- |
| User Profiles     | ✅ Primary          | ❌                     | Privacy, mutability needed |
| Social Metrics    | ✅ Primary          | ❌                     | High frequency updates     |
| Performance Audio | ✅ Primary          | ❌                     | Large files, cost          |
| Viral Detection   | ✅ Primary          | ❌                     | Complex algorithms         |
| Token Ownership   | ❌                  | ✅ Primary             | Trust, transparency        |
| Trading History   | ❌                  | ✅ Primary             | Immutable records          |
| Token Prices      | ❌                  | ✅ Primary             | Market determined          |

### Performance → Token Pipeline

```typescript
// 1. Performance stored in database
const performance = await databaseService.createPerformance({
  farcaster_cast_id: castId,
  user_id: userId,
  audio_url: audioUrl,
});

// 2. Metrics tracked in database (real-time)
await databaseService.updatePerformanceMetrics({
  performance_id: performance.id,
  likes_count: likes,
  shares_count: shares,
});

// 3. Viral detection triggers token creation
if (await viralDetectionService.isViral(performance.id)) {
  // 4. Create blockchain token
  const token = await zoraService.createPerformanceCoin(performance);

  // 5. Link token to performance in database
  await databaseService.createPerformanceCoin({
    performance_id: performance.id,
    coin_address: token.address,
    initial_price: token.price,
  });
}
```

### Benefits of Hybrid Architecture

1. **Performance**: Fast database queries (< 100ms) for social features
2. **Scalability**: Database handles high-frequency operations, blockchain handles high-value operations
3. **Cost Optimization**: Cheap social interactions, expensive operations only when valuable
4. **User Experience**: Real-time updates (database) + true ownership (blockchain)
5. **Data Integrity**: Honest metrics with no mock data, authentic user experiences

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

# GigaVibe Database Setup Guide

## Overview

GigaVibe now uses **real database persistence** instead of mock data. All user interactions, challenge submissions, performance metrics, and analytics are stored in your Supabase database.

## Quick Setup

### 1. Environment Variables

Ensure your `.env.local` file has the correct Supabase credentials:

```bash
# Database (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Schema

Apply the database schema to your Supabase project:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy and run the schema from: `src/lib/database/new-supabase-schema.sql`

### 3. Initialize Database

Run the initialization script to set up default data:

```bash
npm run init-db
```

### 4. Test Connection

Verify everything is working:

```bash
npm run test-db
```

## What's Now Real (No More Mock Data)

### ✅ Challenge Submissions

- All challenge results are stored in `challenge_results` table
- Self-ratings, confidence levels, audio URLs are persisted
- Community can see real submissions from other users

### ✅ Performance Metrics

- Likes, shares, ratings are tracked in `performance_metrics` table
- Real-time updates when users interact with performances
- Analytics events stored for trend analysis

### ✅ Discovery Feed

- Feeds pull from actual database content
- Recent, trending, viral feeds based on real engagement data
- Empty state when no content exists (honest UX)

### ✅ User Data

- User profiles linked to Farcaster FIDs and wallet addresses
- Notification preferences stored and respected
- Real user activity tracking

### ✅ Viral Detection

- Configurable thresholds stored in database
- Queue system for processing viral content
- Analytics tracking for viral events

## Database Tables

### Core Tables

- `users` - User profiles and authentication data
- `performances` - Audio performances and metadata
- `performance_metrics` - Engagement metrics (likes, shares, views)
- `challenge_results` - Challenge submission results

### Analytics & Viral

- `viral_queue` - Queue for viral content processing
- `viral_thresholds` - Configurable viral detection parameters
- `analytics_events` - All user interactions and events

### Notifications

- `notifications` - User notifications
- `notification_preferences` - User notification settings

## API Endpoints Now Using Database

### Challenge APIs

- `POST /api/challenges/submit` - Stores submissions in database
- `GET /api/challenges/songs` - Returns challenges from database
- `GET /api/challenges/featured` - Featured challenges from real data

### Discovery APIs

- `GET /api/discovery/feed/[feedType]` - Real feed data
- `POST /api/discovery/like` - Updates metrics in database
- `POST /api/discovery/rate` - Stores ratings and calculates averages
- `POST /api/discovery/share` - Tracks shares in database

### Analytics

- All user interactions are tracked in `analytics_events`
- Real-time metrics calculation
- Viral detection based on actual engagement

## Development Workflow

### 1. Fresh Database

If you need to reset your database:

```bash
# Apply schema again in Supabase SQL Editor
# Then reinitialize
npm run init-db
```

### 2. Adding Test Data

The app will show empty states when no data exists. To add test data:

1. Use the app to submit some challenge performances
2. Interact with performances (like, rate, share)
3. The database will populate with real user interactions

### 3. Monitoring

Check your Supabase dashboard to see:

- Real-time data as users interact
- Analytics events being logged
- Performance metrics being updated

## Troubleshooting

### Database Connection Issues

```bash
# Test your connection
npm run test-db

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Empty Feeds

If discovery feeds are empty:

1. Submit some challenge performances through the app
2. The feeds will populate with real content
3. No more fake/mock data will be shown

### Schema Errors

If you get table not found errors:

1. Ensure you've run the SQL schema in Supabase
2. Check that all tables were created successfully
3. Verify your service role key has proper permissions

## Benefits of Real Database

### For Users

- ✅ **Honest UX**: No fake engagement numbers or mock content
- ✅ **Real Community**: See actual submissions from other users
- ✅ **Persistent Data**: Your submissions and interactions are saved
- ✅ **Real Metrics**: Like counts, ratings reflect actual user engagement

### For Developers

- ✅ **Real Testing**: Test with actual data flows
- ✅ **Analytics**: Track real user behavior and app performance
- ✅ **Scalability**: Database designed for production use
- ✅ **Debugging**: Real data makes issues easier to identify

## Next Steps

1. **Run the setup**: Follow the quick setup steps above
2. **Test the app**: Submit some challenges and interact with content
3. **Monitor data**: Check your Supabase dashboard to see real data flowing
4. **Scale up**: The database is ready for production traffic

Your GigaVibe app now provides an authentic experience with real data persistence!
