/**
 * Centralized mock data service
 * Clean, organized mock data generation
 */

export enum QueryType {
  TOKENS = 'tokens',
  TRADES = 'trades',
  USER_BALANCES = 'user_balances'
}

export class MockDataService {
  private static instance: MockDataService;

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  getZoraMockData(queryType: QueryType): any {
    const mockDataMap = {
      [QueryType.TOKENS]: {
        data: { tokens: [] }
      },
      [QueryType.TRADES]: {
        data: { trades: [] }
      },
      [QueryType.USER_BALANCES]: {
        data: { user: { tokenBalances: [] } }
      }
    };

    return mockDataMap[queryType] || { data: {} };
  }

  detectQueryType(query: string): QueryType {
    if (query.includes('tokens') || query.includes('GetGigavibeCoins') || query.includes('SearchCoins')) {
      return QueryType.TOKENS;
    }
    if (query.includes('trades') || query.includes('GetRecentTrades')) {
      return QueryType.TRADES;
    }
    if (query.includes('user') || query.includes('GetUserCoins')) {
      return QueryType.USER_BALANCES;
    }
    return QueryType.TOKENS; // default
  }
}