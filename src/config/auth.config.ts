// Production auth configuration
export const AUTH_CONFIG = {
  // Session management
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  
  // Storage keys
  STORAGE_KEYS: {
    FARCASTER_SIGNER: 'gigavibe_signer_uuid',
    FARCASTER_USER: 'gigavibe_user_data',
    FARCASTER_TIMESTAMP: 'gigavibe_auth_timestamp',
    ETH_USER: 'gigavibe_eth_user',
    ETH_TIMESTAMP: 'gigavibe_eth_timestamp',
    AUTH_METHOD: 'gigavibe_auth_method'
  },
  
  // Security settings
  SECURITY: {
    // Domains allowed for SIWE
    ALLOWED_DOMAINS: [
      'localhost',
      '127.0.0.1',
      'gigavibe.app',
      'www.gigavibe.app',
      process.env.NEXT_PUBLIC_VERCEL_URL,
      process.env.URL,
      process.env.VERCEL_URL
    ].filter(Boolean),
    
    // Session validation
    VALIDATE_ORIGIN: process.env.NODE_ENV === 'production',
    REQUIRE_HTTPS: process.env.NODE_ENV === 'production',
    
    // Rate limiting
    MAX_AUTH_ATTEMPTS: 5,
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  },
  
  // Farcaster settings
  FARCASTER: {
    HUB_URL: process.env.NEXT_PUBLIC_NEYNAR_HUB_URL || 'https://hub-api.neynar.com',
    API_KEY: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
    // Permissions for posting
    REQUIRED_PERMISSIONS: ['post_cast', 'read_cast'],
  },
  
  // Error messages
  ERRORS: {
    INVALID_SIGNATURE: 'Invalid signature. Please try again.',
    EXPIRED_SESSION: 'Your session has expired. Please sign in again.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    UNAUTHORIZED: 'Unauthorized access. Please sign in.',
    RATE_LIMITED: 'Too many attempts. Please wait before trying again.',
    INVALID_DOMAIN: 'Invalid domain. Please use the correct application URL.',
    MISSING_WALLET: 'No wallet found. Please install a compatible wallet.',
    USER_REJECTED: 'User rejected the request.',
    INVALID_CHAIN: 'Please connect to the correct network.',
  },
  
  // Success messages
  SUCCESS: {
    SIGN_IN: 'Successfully signed in!',
    SIGN_OUT: 'Successfully signed out!',
    PROFILE_UPDATED: 'Profile updated successfully!',
  },
  
  // Feature flags
  FEATURES: {
    MULTI_ACCOUNT: true,
    REMEMBER_ME: true,
    BIOMETRIC_AUTH: false, // Future feature
    TWO_FACTOR: false, // Future feature
  },
  
  // Analytics events
  ANALYTICS: {
    SIGN_IN_STARTED: 'auth_sign_in_started',
    SIGN_IN_SUCCESS: 'auth_sign_in_success',
    SIGN_IN_FAILED: 'auth_sign_in_failed',
    SIGN_OUT: 'auth_sign_out',
    METHOD_SELECTED: 'auth_method_selected',
  }
};

// Helper functions
export const getStorageKey = (key: keyof typeof AUTH_CONFIG.STORAGE_KEYS) => {
  return AUTH_CONFIG.STORAGE_KEYS[key];
};

export const isProductionDomain = (domain: string) => {
  return AUTH_CONFIG.SECURITY.ALLOWED_DOMAINS.includes(domain);
};

export const getErrorMessage = (errorCode: keyof typeof AUTH_CONFIG.ERRORS) => {
  return AUTH_CONFIG.ERRORS[errorCode];
};

export const getSuccessMessage = (successCode: keyof typeof AUTH_CONFIG.SUCCESS) => {
  return AUTH_CONFIG.SUCCESS[successCode];
};

// Validation helpers
export const validateAuthSession = (timestamp: number) => {
  const now = Date.now();
  return (now - timestamp) < AUTH_CONFIG.SESSION_DURATION;
};

export const isSecureContext = () => {
  if (typeof window === 'undefined') return true;
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
};

// Rate limiting helpers
export const checkRateLimit = (attempts: number, windowStart: number) => {
  const now = Date.now();
  const windowExpired = (now - windowStart) > AUTH_CONFIG.SECURITY.RATE_LIMIT_WINDOW;
  
  if (windowExpired) {
    return { allowed: true, resetWindow: true };
  }
  
  return { 
    allowed: attempts < AUTH_CONFIG.SECURITY.MAX_AUTH_ATTEMPTS, 
    resetWindow: false 
  };
};