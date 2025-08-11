'use client';

import { Address } from 'viem';
import { PerformanceCoin, TradingMetrics } from './types';
import { ErrorHandlingService } from '@/lib/services/ErrorHandlingService';
import { MockDataService } from '@/lib/services/MockDataService';

/**
 * Real Zora API Service for fetching live market data
 */
export class ZoraAPIService {
  private static instance: ZoraAPIService;
  private baseURL = '/api/zora/proxy';

  constructor() {
    // No need for API key in client since we're using the proxy
  }

  static getInstance(): ZoraAPIService {
    if (!ZoraAPIService.instance) {
      ZoraAPIService.instance = new ZoraAPIService();
    }
    return ZoraAPIService.instance;
  }

  /**
   * Fetch all GIGAVIBE performance coins from Zora
   */
  async fetchPerformanceCoins(): Promise<PerformanceCoin[]> {
    try {
      const query = `
        query GetGigavibeCoins($first: Int!, $where: Token_filter) {
          tokens(first: $first, where: $where) {
            id
            address
            name
            symbol
            creator
            uri
            totalSupply
            marketData {
              price
              volume24h
              marketCap
              holders
              priceChange24h
              priceChangePercent24h
            }
          }
        }
      `;

      const variables = {
        first: 100,
        where: {
          // Filter for GIGAVIBE performance coins
          name_contains: "Reality Check",
          // Add other filters as needed
        }
      };

      const response = await this.makeGraphQLRequest(query, variables);
      
      if (!response.data?.tokens) {
        throw new Error('No performance coins found');
      }

      return response.data.tokens.map(this.transformTokenToPerformanceCoin);
    } catch (error) {
      console.error('[ZoraAPIService] Failed to fetch performance coins:', error);
      throw new Error(`Unable to fetch performance coins: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch user's coin holdings
   */
  async fetchUserCoins(userAddress: Address): Promise<PerformanceCoin[]> {
    try {
      const query = `
        query GetUserCoins($userAddress: String!, $first: Int!) {
          user(id: $userAddress) {
            tokenBalances(first: $first, where: { balance_gt: "0" }) {
              token {
                id
                address
                name
                symbol
                creator
                uri
                marketData {
                  price
                  volume24h
                  marketCap
                  holders
                  priceChange24h
                  priceChangePercent24h
                }
              }
              balance
            }
          }
        }
      `;

      const variables = {
        userAddress: userAddress,
        first: 50
      };

      const response = await this.makeGraphQLRequest(query, variables);
      
      if (!response.data?.user?.tokenBalances) {
        // Empty results is a valid state - user might not own any coins
        return [];
      }

      return response.data.user.tokenBalances
        .filter((balance: any) => balance.token.name.includes('Reality Check'))
        .map((balance: any) => this.transformTokenToPerformanceCoin(balance.token));
    } catch (error) {
      console.error('[ZoraAPIService] Failed to fetch user coins:', error);
      throw new Error(`Unable to fetch user coins: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch recent trading activity
   */
  async fetchRecentTrades(limit: number = 20) {
    try {
      const query = `
        query GetRecentTrades($first: Int!, $where: Trade_filter) {
          trades(first: $first, where: $where, orderBy: timestamp, orderDirection: desc) {
            id
            token {
              address
              name
              symbol
            }
            type
            amount
            price
            timestamp
            trader
          }
        }
      `;

      const variables = {
        first: limit,
        where: {
          token_: {
            name_contains: "Reality Check"
          }
        }
      };

      const response = await this.makeGraphQLRequest(query, variables);
      
      if (!response.data?.trades) {
        throw new Error('No trade data available');
      }
      
      return response.data.trades;
    } catch (error) {
      console.error('[ZoraAPIService] Failed to fetch recent trades:', error);
      throw new Error(`Unable to fetch recent trades: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search performance coins by query
   */
  async searchCoins(query: string): Promise<PerformanceCoin[]> {
    try {
      const graphQLQuery = `
        query SearchCoins($first: Int!, $where: Token_filter) {
          tokens(first: $first, where: $where) {
            id
            address
            name
            symbol
            creator
            uri
            marketData {
              price
              volume24h
              marketCap
              holders
              priceChange24h
              priceChangePercent24h
            }
          }
        }
      `;

      const variables = {
        first: 50,
        where: {
          or: [
            { name_contains_nocase: query },
            { symbol_contains_nocase: query }
          ],
          name_contains: "Reality Check"
        }
      };

      const response = await this.makeGraphQLRequest(graphQLQuery, variables);
      
      if (!response.data?.tokens) {
        // Empty search results is a valid state
        return [];
      }

      return response.data.tokens.map(this.transformTokenToPerformanceCoin);
    } catch (error) {
      console.error('[ZoraAPIService] Failed to search coins:', error);
      throw new Error(`Search operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get trading metrics for dashboard
   */
  async getTradingMetrics(): Promise<TradingMetrics> {
    try {
      const [coins, trades] = await Promise.all([
        this.fetchPerformanceCoins(),
        this.fetchRecentTrades(10)
      ]);

      const totalVolume = coins.reduce((sum, coin) => sum + coin.marketData.volume24h, 0);
      const topPerformer = coins.sort((a, b) => b.marketData.priceChangePercent24h - a.marketData.priceChangePercent24h)[0] || null;
      const trendingCoins = coins
        .filter(coin => coin.marketData.priceChangePercent24h > 10)
        .slice(0, 5);

      return {
        totalVolume,
        totalCoins: coins.length,
        topPerformer,
        trendingCoins,
        recentTrades: trades.map(trade => ({
          coinAddress: trade.token.address as Address,
          type: trade.type as 'buy' | 'sell',
          amount: parseFloat(trade.amount),
          price: parseFloat(trade.price),
          timestamp: new Date(trade.timestamp * 1000),
          trader: trade.trader as Address
        }))
      };
    } catch (error) {
      console.error('[ZoraAPIService] Failed to get trading metrics:', error);
      throw new Error(`Unable to retrieve trading metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Make GraphQL request to Zora API via proxy
   */
  private async makeGraphQLRequest(query: string, variables: any) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        return this.handleApiError(response, query);
      }

      const result = await response.json();
      
      if (result.error) {
        return this.handleApiError({ status: 400, message: result.error }, query);
      }

      return result;
    } catch (error) {
      return this.handleApiError(error, query);
    }
  }

  private handleApiError(error: any, query: string) {
    const errorHandler = ErrorHandlingService.getInstance();
    const mockDataService = MockDataService.getInstance();
    
    const serviceError = errorHandler.handleApiError(error, 'Zora API');
    errorHandler.logError(serviceError);
    
    if (serviceError.shouldFallback) {
      const queryType = mockDataService.detectQueryType(query);
      return mockDataService.getZoraMockData(queryType);
    }
    
    throw error;
  }

  /**
   * Transform Zora token data to PerformanceCoin
   */
  private transformTokenToPerformanceCoin(token: any): PerformanceCoin {
    // Parse metadata from token URI to extract performance data
    const performance = this.parsePerformanceFromMetadata(token);
    
    return {
      address: token.address as Address,
      name: token.name,
      symbol: token.symbol,
      creator: token.creator as Address,
      performance,
      marketData: {
        price: parseFloat(token.marketData?.price || '0'),
        volume24h: parseFloat(token.marketData?.volume24h || '0'),
        marketCap: parseFloat(token.marketData?.marketCap || '0'),
        holders: parseInt(token.marketData?.holders || '0'),
        priceChange24h: parseFloat(token.marketData?.priceChange24h || '0'),
        priceChangePercent24h: parseFloat(token.marketData?.priceChangePercent24h || '0')
      },
      metadata: {
        description: token.description || '',
        image: token.image || '',
        attributes: token.attributes || []
      }
    };
  }

  /**
   * Parse performance data from token metadata
   */
  private parsePerformanceFromMetadata(token: any): any {
    // This would parse the actual metadata to extract performance details
    // For now, return a basic structure
    return {
      id: token.id,
      eventId: 'parsed-from-metadata',
      challengeTitle: token.name.replace(' - Reality Check', ''),
      challengeId: 'parsed-challenge-id',
      userAddress: token.creator as Address,
      selfRating: 4, // Parse from metadata
      communityRating: 3, // Parse from metadata
      gap: 1, // Calculate from ratings
      wittyCommentary: 'Parsed from metadata',
      shareCount: 0, // Parse from metadata
      timestamp: new Date(),
      audioUrl: 'parsed-audio-url',
      category: 'quality' as const
    };
  }

}