/**
 * Environment variable utilities with SSR safety
 */

/**
 * Get client-side environment variable safely
 * Only returns variables that start with NEXT_PUBLIC_
 */
export function getClientEnv(key: string): string | undefined {
  if (typeof window === 'undefined') {
    // Server-side: only return NEXT_PUBLIC_ variables
    if (key.startsWith('NEXT_PUBLIC_')) {
      return process.env[key];
    }
    return undefined;
  }
  
  // Client-side: access from window.__NEXT_DATA__ or process.env
  try {
    return process.env[key];
  } catch {
    return undefined;
  }
}

/**
 * Get server-side environment variable
 * Can access any environment variable on the server
 */
export function getServerEnv(key: string): string | undefined {
  if (typeof window !== 'undefined') {
    console.warn(`Attempted to access server env "${key}" on client side`);
    return undefined;
  }
  
  return process.env[key];
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return getClientEnv('NODE_ENV') === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return getClientEnv('NODE_ENV') === 'production';
}

/**
 * Get the app URL with fallback
 */
export function getAppUrl(): string {
  return getClientEnv('NEXT_PUBLIC_URL') || 'http://localhost:3000';
}

/**
 * Get the app name with fallback
 */
export function getAppName(): string {
  return getClientEnv('NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME') || 'GIGAVIBE';
}