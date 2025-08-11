/**
 * Centralized error handling service
 * Follows DRY, Clean, Organized, Modular principles
 */

export enum ErrorType {
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  RATE_LIMIT = 'RATE_LIMIT',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  NETWORK = 'NETWORK'
}

export interface ServiceError {
  type: ErrorType;
  message: string;
  service: string;
  shouldFallback: boolean;
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  handleApiError(error: any, serviceName: string): ServiceError {
    if (error.status >= 500) {
      return {
        type: ErrorType.API_UNAVAILABLE,
        message: `${serviceName} temporarily unavailable`,
        service: serviceName,
        shouldFallback: true
      };
    }

    if (error.status === 429) {
      return {
        type: ErrorType.RATE_LIMIT,
        message: `${serviceName} rate limit exceeded`,
        service: serviceName,
        shouldFallback: true
      };
    }

    return {
      type: ErrorType.NETWORK,
      message: `${serviceName} request failed`,
      service: serviceName,
      shouldFallback: true
    };
  }

  logError(error: ServiceError): void {
    if (error.shouldFallback) {
      console.warn(`[${error.service}] ${error.message} - using fallback`);
    } else {
      console.error(`[${error.service}] ${error.message}`);
    }
  }
}