# Zora API Routes

This directory contains API routes for Zora operations. These routes handle server-side operations with the Zora SDK, separating the client-side code from the server-side implementation.

## Routes

- `/api/zora/trade` - Handles coin trading operations (buy/sell)
- `/api/zora/info` - Retrieves coin information
- `/api/zora/balance` - Gets user balance for a specific coin
- `/api/zora/create` - Validates and prepares coin creation parameters

## Architecture

These API routes isolate the Zora SDK to the server side where it belongs, ensuring that client components only interact with these routes rather than directly with the SDK. This approach:

1. Improves type safety
2. Reduces bundle size
3. Keeps sensitive operations on the server
4. Provides a cleaner separation of concerns
