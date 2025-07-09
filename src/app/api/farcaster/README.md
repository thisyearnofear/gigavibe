# Farcaster API Routes

This directory contains API routes that act as a bridge between the client-side components and the Neynar SDK for Farcaster integration.

## Architecture

The Neynar Node.js SDK is designed for server environments, not browser environments. To use it in a Next.js application, we've:

1. Created server-side API routes to interact with the Neynar SDK
2. Updated client-side code to make fetch requests to these API routes
3. Organized routes by domain for better maintainability

## API Routes

The API is structured into domain-specific routes:

### `/api/farcaster/user`

User-related operations:

- `fetchUserProfile`: Get user data by FID
- `fetchUserByAddress`: Get user data by Ethereum address

### `/api/farcaster/cast`

Cast (post) related operations:

- `publishCast`: Create a new cast
- `fetchReplies`: Get replies to a cast
- `searchCasts`: Search for casts
- `fetchChannel`: Get casts in a channel

### `/api/farcaster/feed`

Feed related operations:

- `fetchFeed`: Get a user's feed

## Client-Side Usage

The client-side code interacts with these API routes using the `FarcasterDataService` class, which:

1. Uses standard `fetch` calls to our API routes
2. Handles data transformation
3. Provides a clean interface for components

## Environment Variables

These API routes use the following environment variables:

- `NEYNAR_API_KEY`: Server-side API key for Neynar (preferred)
- `NEXT_PUBLIC_NEYNAR_API_KEY`: Client-side API key (fallback)

For security, use `NEYNAR_API_KEY` in production environments.
