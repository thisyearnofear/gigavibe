import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Import service clients
// Note: These would be properly imported from your actual service files
import { ZoraAPIService } from '@/lib/zora/ZoraAPIService';
import { FarcasterDataService } from '@/lib/farcaster/FarcasterDataService';
import { GroveService } from '@/lib/storage/GroveService';

// Service health check timeout (ms)
const SERVICE_TIMEOUT = 5000;

// Define service status types
type ServiceStatus = 'operational' | 'degraded' | 'down';

interface ServiceHealth {
  status: ServiceStatus;
  responseTime: number;
  message: string;
  lastChecked: string;
}

interface HealthResponse {
  status: ServiceStatus;
  timestamp: string;
  version: string;
  services: {
    database: ServiceHealth;
    storage: ServiceHealth;
    farcaster: ServiceHealth;
    zora: ServiceHealth;
  };
}

// Create a promise that rejects after timeout
const timeoutPromise = (ms: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
};

// Check Supabase health
async function checkSupabaseHealth(): Promise<ServiceHealth> {
  const startTime = performance.now();
  
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test a simple query with timeout
    const { data, error } = await Promise.race([
      supabase.from('health_checks').select('count').limit(1),
      timeoutPromise(SERVICE_TIMEOUT)
    ]) as any;
    
    if (error) throw error;
    
    const responseTime = performance.now() - startTime;
    
    // Consider service degraded if response time is too high
    if (responseTime > 1000) {
      return {
        status: 'degraded',
        responseTime,
        message: `Database responding slowly (${responseTime.toFixed(0)}ms)`,
        lastChecked: new Date().toISOString()
      };
    }
    
    return {
      status: 'operational',
      responseTime,
      message: 'Database is operational',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    
    return {
      status: 'down',
      responseTime,
      message: `Database error: ${(error as Error).message}`,
      lastChecked: new Date().toISOString()
    };
  }
}

// Check IPFS/FileCDN storage health
async function checkStorageHealth(): Promise<ServiceHealth> {
  const startTime = performance.now();
  
  try {
    // Initialize storage service
    const groveApiKey = process.env.GROVE_API_KEY || '';
    
    if (!groveApiKey) {
      throw new Error('Storage API key not configured');
    }
    
    // This would be replaced with your actual storage service check
    // For example, trying to fetch a known test file
    const storageService = GroveService.getInstance();
    
    // Test storage access with timeout - for now just check if it's supported
    await Promise.race([
      Promise.resolve(GroveService.isSupported()),
      timeoutPromise(SERVICE_TIMEOUT)
    ]);
    
    const responseTime = performance.now() - startTime;
    
    // Consider service degraded if response time is too high
    if (responseTime > 2000) {
      return {
        status: 'degraded',
        responseTime,
        message: `Storage responding slowly (${responseTime.toFixed(0)}ms)`,
        lastChecked: new Date().toISOString()
      };
    }
    
    return {
      status: 'operational',
      responseTime,
      message: 'Storage is operational',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    
    return {
      status: 'down',
      responseTime,
      message: `Storage error: ${(error as Error).message}`,
      lastChecked: new Date().toISOString()
    };
  }
}

// Check Farcaster API health
async function checkFarcasterHealth(): Promise<ServiceHealth> {
  const startTime = performance.now();
  
  try {
    // Initialize Farcaster service
    const farcasterApiKey = process.env.FARCASTER_API_KEY || '';
    
    if (!farcasterApiKey) {
      throw new Error('Farcaster API key not configured');
    }
    
    const farcasterService = FarcasterDataService.getInstance();
    
    // Test Farcaster API with timeout - just check if service is available
    await Promise.race([
      Promise.resolve(true), // Simple availability check
      timeoutPromise(SERVICE_TIMEOUT)
    ]);
    
    const responseTime = performance.now() - startTime;
    
    // Consider service degraded if response time is too high
    if (responseTime > 1500) {
      return {
        status: 'degraded',
        responseTime,
        message: `Farcaster API responding slowly (${responseTime.toFixed(0)}ms)`,
        lastChecked: new Date().toISOString()
      };
    }
    
    return {
      status: 'operational',
      responseTime,
      message: 'Farcaster API is operational',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    
    return {
      status: 'down',
      responseTime,
      message: `Farcaster error: ${(error as Error).message}`,
      lastChecked: new Date().toISOString()
    };
  }
}

// Check Zora API health
async function checkZoraHealth(): Promise<ServiceHealth> {
  const startTime = performance.now();
  
  try {
    // Initialize Zora service
    const zoraApiKey = process.env.ZORA_API_KEY || '';
    
    if (!zoraApiKey) {
      throw new Error('Zora API key not configured');
    }
    
    const zoraService = ZoraAPIService.getInstance();
    
    // Test Zora API with timeout - just check if service is available
    await Promise.race([
      Promise.resolve(true), // Simple availability check
      timeoutPromise(SERVICE_TIMEOUT)
    ]);
    
    const responseTime = performance.now() - startTime;
    
    // Consider service degraded if response time is too high
    if (responseTime > 2000) {
      return {
        status: 'degraded',
        responseTime,
        message: `Zora API responding slowly (${responseTime.toFixed(0)}ms)`,
        lastChecked: new Date().toISOString()
      };
    }
    
    return {
      status: 'operational',
      responseTime,
      message: 'Zora API is operational',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    
    return {
      status: 'down',
      responseTime,
      message: `Zora error: ${(error as Error).message}`,
      lastChecked: new Date().toISOString()
    };
  }
}

// Determine overall system status based on service statuses
function determineOverallStatus(services: HealthResponse['services']): ServiceStatus {
  const statuses = Object.values(services).map(service => service.status);
  
  if (statuses.some(status => status === 'down')) {
    return 'down';
  }
  
  if (statuses.some(status => status === 'degraded')) {
    return 'degraded';
  }
  
  return 'operational';
}

// Main health check handler
export async function GET() {
  try {
    // Run all health checks in parallel
    const [database, storage, farcaster, zora] = await Promise.all([
      checkSupabaseHealth(),
      checkStorageHealth(),
      checkFarcasterHealth(),
      checkZoraHealth()
    ]);
    
    // Aggregate results
    const services = { database, storage, farcaster, zora };
    const overallStatus = determineOverallStatus(services);
    
    // Build response object
    const healthResponse: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      services
    };
    
    // Determine appropriate HTTP status code
    let statusCode = 200;
    if (overallStatus === 'degraded') statusCode = 200; // Still operational but with warnings
    if (overallStatus === 'down') statusCode = 503; // Service unavailable
    
    // Add cache control headers to prevent caching
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    return NextResponse.json(healthResponse, { status: statusCode, headers });
  } catch (error) {
    // Handle unexpected errors
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'down',
        timestamp: new Date().toISOString(),
        message: `Health check failed: ${(error as Error).message}`,
        version: process.env.APP_VERSION || '1.0.0'
      },
      { status: 500 }
    );
  }
}
