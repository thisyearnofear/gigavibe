import { analyticsManager, AnalyticsEventType, PerformanceMetricType } from '../analytics/AnalyticsManager';
import { audioManager } from '../audio/AudioServiceManager';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

/**
 * Resource priority levels
 */
export enum ResourcePriority {
  CRITICAL = 'critical',   // Must load immediately (UI, core functionality)
  HIGH = 'high',           // Should load soon (visible content)
  MEDIUM = 'medium',       // Can load after critical content (below-fold content)
  LOW = 'low',             // Can load when idle (non-essential features)
  LAZY = 'lazy'            // Only load on demand (rarely used features)
}

/**
 * Network connection types
 */
export enum ConnectionType {
  UNKNOWN = 'unknown',
  ETHERNET = 'ethernet',
  WIFI = 'wifi',
  CELLULAR_4G = '4g',
  CELLULAR_3G = '3g',
  CELLULAR_2G = '2g',
  SLOW_2G = 'slow-2g',
  OFFLINE = 'offline'
}

/**
 * Device power state
 */
export enum PowerState {
  CHARGING = 'charging',
  BATTERY_HIGH = 'battery-high',    // > 50%
  BATTERY_MEDIUM = 'battery-medium', // 20-50%
  BATTERY_LOW = 'battery-low',      // < 20%
  BATTERY_CRITICAL = 'battery-critical', // < 10%
  UNKNOWN = 'unknown'
}

/**
 * Performance profile based on device capabilities and conditions
 */
export enum PerformanceProfile {
  ULTRA = 'ultra',       // High-end device, good connection, charging
  HIGH = 'high',         // Good device, good connection
  MEDIUM = 'medium',     // Average device or connection
  LOW = 'low',           // Low-end device or poor connection
  BATTERY_SAVER = 'battery-saver', // Battery optimization mode
  DATA_SAVER = 'data-saver'  // Data saving mode
}

/**
 * Options for lazy loading components
 */
export interface LazyLoadOptions {
  priority: ResourcePriority;
  ssr?: boolean;
  loading?: React.ComponentType;
  preload?: boolean;
}

/**
 * Options for audio optimization
 */
export interface AudioOptimizationOptions {
  preloadStrategy: 'none' | 'metadata' | 'auto';
  progressiveLoading: boolean;
  cacheInServiceWorker: boolean;
  maxCacheSize: number; // in MB
  maxConcurrentLoads: number;
  prioritizePlayback: boolean; // Optimize for playback vs recording
  lowLatencyMode: boolean;
}

/**
 * Options for Web3 operation optimization
 */
export interface Web3OptimizationOptions {
  batchTransactions: boolean;
  cacheResolution: number; // in seconds
  offlineSupport: boolean;
  fallbackProviders: boolean;
  estimateGasAutomatically: boolean;
  maxRetries: number;
  retryDelay: number; // in ms
}

/**
 * Options for memory management
 */
export interface MemoryManagementOptions {
  maxAudioBufferSize: number; // in MB
  maxImageCacheSize: number; // in MB
  aggressiveGC: boolean;
  monitorMemoryUsage: boolean;
  lowMemoryThreshold: number; // in MB
  criticalMemoryThreshold: number; // in MB
}

/**
 * Options for service worker
 */
export interface ServiceWorkerOptions {
  enabled: boolean;
  scope: string;
  updateInterval: number; // in hours
  cacheDuration: number; // in days
  cacheAudio: boolean;
  cacheImages: boolean;
  cacheAPIs: boolean;
  cacheWeb3Responses: boolean;
  offlineSupport: boolean;
  backgroundSync: boolean;
}

/**
 * Complete performance optimization configuration
 */
export interface PerformanceOptimizerConfig {
  performanceProfile: PerformanceProfile;
  audio: AudioOptimizationOptions;
  web3: Web3OptimizationOptions;
  memory: MemoryManagementOptions;
  serviceWorker: ServiceWorkerOptions;
  prefetchLinks: boolean;
  lazyLoadImages: boolean;
  lazyLoadThreshold: number; // in pixels
  useBrowserCache: boolean;
  useIndexedDB: boolean;
  monitorNetworkChanges: boolean;
  monitorBatteryStatus: boolean;
  adaptiveQuality: boolean;
  disableAnimationsOnLowPower: boolean;
  disableBackgroundProcessing: boolean;
  enableDebugMode: boolean;
}

/**
 * Default configuration based on performance profiles
 */
const DEFAULT_CONFIGS: Record<PerformanceProfile, PerformanceOptimizerConfig> = {
  [PerformanceProfile.ULTRA]: {
    performanceProfile: PerformanceProfile.ULTRA,
    audio: {
      preloadStrategy: 'auto',
      progressiveLoading: true,
      cacheInServiceWorker: true,
      maxCacheSize: 500,
      maxConcurrentLoads: 5,
      prioritizePlayback: true,
      lowLatencyMode: true
    },
    web3: {
      batchTransactions: true,
      cacheResolution: 60,
      offlineSupport: true,
      fallbackProviders: true,
      estimateGasAutomatically: true,
      maxRetries: 5,
      retryDelay: 1000
    },
    memory: {
      maxAudioBufferSize: 500,
      maxImageCacheSize: 300,
      aggressiveGC: false,
      monitorMemoryUsage: true,
      lowMemoryThreshold: 200,
      criticalMemoryThreshold: 100
    },
    serviceWorker: {
      enabled: true,
      scope: '/',
      updateInterval: 24,
      cacheDuration: 7,
      cacheAudio: true,
      cacheImages: true,
      cacheAPIs: true,
      cacheWeb3Responses: true,
      offlineSupport: true,
      backgroundSync: true
    },
    prefetchLinks: true,
    lazyLoadImages: true,
    lazyLoadThreshold: 300,
    useBrowserCache: true,
    useIndexedDB: true,
    monitorNetworkChanges: true,
    monitorBatteryStatus: true,
    adaptiveQuality: true,
    disableAnimationsOnLowPower: false,
    disableBackgroundProcessing: false,
    enableDebugMode: false
  },
  
  [PerformanceProfile.HIGH]: {
    performanceProfile: PerformanceProfile.HIGH,
    audio: {
      preloadStrategy: 'metadata',
      progressiveLoading: true,
      cacheInServiceWorker: true,
      maxCacheSize: 300,
      maxConcurrentLoads: 3,
      prioritizePlayback: true,
      lowLatencyMode: true
    },
    web3: {
      batchTransactions: true,
      cacheResolution: 120,
      offlineSupport: true,
      fallbackProviders: true,
      estimateGasAutomatically: true,
      maxRetries: 3,
      retryDelay: 2000
    },
    memory: {
      maxAudioBufferSize: 300,
      maxImageCacheSize: 200,
      aggressiveGC: false,
      monitorMemoryUsage: true,
      lowMemoryThreshold: 150,
      criticalMemoryThreshold: 75
    },
    serviceWorker: {
      enabled: true,
      scope: '/',
      updateInterval: 48,
      cacheDuration: 5,
      cacheAudio: true,
      cacheImages: true,
      cacheAPIs: true,
      cacheWeb3Responses: true,
      offlineSupport: true,
      backgroundSync: true
    },
    prefetchLinks: true,
    lazyLoadImages: true,
    lazyLoadThreshold: 200,
    useBrowserCache: true,
    useIndexedDB: true,
    monitorNetworkChanges: true,
    monitorBatteryStatus: true,
    adaptiveQuality: true,
    disableAnimationsOnLowPower: false,
    disableBackgroundProcessing: false,
    enableDebugMode: false
  },
  
  [PerformanceProfile.MEDIUM]: {
    performanceProfile: PerformanceProfile.MEDIUM,
    audio: {
      preloadStrategy: 'metadata',
      progressiveLoading: true,
      cacheInServiceWorker: true,
      maxCacheSize: 200,
      maxConcurrentLoads: 2,
      prioritizePlayback: true,
      lowLatencyMode: false
    },
    web3: {
      batchTransactions: true,
      cacheResolution: 300,
      offlineSupport: true,
      fallbackProviders: true,
      estimateGasAutomatically: true,
      maxRetries: 3,
      retryDelay: 3000
    },
    memory: {
      maxAudioBufferSize: 200,
      maxImageCacheSize: 100,
      aggressiveGC: true,
      monitorMemoryUsage: true,
      lowMemoryThreshold: 100,
      criticalMemoryThreshold: 50
    },
    serviceWorker: {
      enabled: true,
      scope: '/',
      updateInterval: 72,
      cacheDuration: 3,
      cacheAudio: true,
      cacheImages: true,
      cacheAPIs: true,
      cacheWeb3Responses: false,
      offlineSupport: true,
      backgroundSync: false
    },
    prefetchLinks: false,
    lazyLoadImages: true,
    lazyLoadThreshold: 100,
    useBrowserCache: true,
    useIndexedDB: true,
    monitorNetworkChanges: true,
    monitorBatteryStatus: true,
    adaptiveQuality: true,
    disableAnimationsOnLowPower: true,
    disableBackgroundProcessing: false,
    enableDebugMode: false
  },
  
  [PerformanceProfile.LOW]: {
    performanceProfile: PerformanceProfile.LOW,
    audio: {
      preloadStrategy: 'none',
      progressiveLoading: true,
      cacheInServiceWorker: true,
      maxCacheSize: 100,
      maxConcurrentLoads: 1,
      prioritizePlayback: true,
      lowLatencyMode: false
    },
    web3: {
      batchTransactions: true,
      cacheResolution: 600,
      offlineSupport: true,
      fallbackProviders: true,
      estimateGasAutomatically: false,
      maxRetries: 2,
      retryDelay: 5000
    },
    memory: {
      maxAudioBufferSize: 100,
      maxImageCacheSize: 50,
      aggressiveGC: true,
      monitorMemoryUsage: true,
      lowMemoryThreshold: 50,
      criticalMemoryThreshold: 25
    },
    serviceWorker: {
      enabled: true,
      scope: '/',
      updateInterval: 168,
      cacheDuration: 1,
      cacheAudio: true,
      cacheImages: false,
      cacheAPIs: false,
      cacheWeb3Responses: false,
      offlineSupport: true,
      backgroundSync: false
    },
    prefetchLinks: false,
    lazyLoadImages: true,
    lazyLoadThreshold: 0,
    useBrowserCache: true,
    useIndexedDB: false,
    monitorNetworkChanges: true,
    monitorBatteryStatus: true,
    adaptiveQuality: true,
    disableAnimationsOnLowPower: true,
    disableBackgroundProcessing: true,
    enableDebugMode: false
  },
  
  [PerformanceProfile.BATTERY_SAVER]: {
    performanceProfile: PerformanceProfile.BATTERY_SAVER,
    audio: {
      preloadStrategy: 'none',
      progressiveLoading: false,
      cacheInServiceWorker: true,
      maxCacheSize: 50,
      maxConcurrentLoads: 1,
      prioritizePlayback: false,
      lowLatencyMode: false
    },
    web3: {
      batchTransactions: true,
      cacheResolution: 1800,
      offlineSupport: true,
      fallbackProviders: false,
      estimateGasAutomatically: false,
      maxRetries: 1,
      retryDelay: 10000
    },
    memory: {
      maxAudioBufferSize: 50,
      maxImageCacheSize: 25,
      aggressiveGC: true,
      monitorMemoryUsage: true,
      lowMemoryThreshold: 30,
      criticalMemoryThreshold: 15
    },
    serviceWorker: {
      enabled: true,
      scope: '/',
      updateInterval: 336,
      cacheDuration: 1,
      cacheAudio: true,
      cacheImages: false,
      cacheAPIs: false,
      cacheWeb3Responses: false,
      offlineSupport: true,
      backgroundSync: false
    },
    prefetchLinks: false,
    lazyLoadImages: true,
    lazyLoadThreshold: 0,
    useBrowserCache: true,
    useIndexedDB: false,
    monitorNetworkChanges: false,
    monitorBatteryStatus: true,
    adaptiveQuality: true,
    disableAnimationsOnLowPower: true,
    disableBackgroundProcessing: true,
    enableDebugMode: false
  },
  
  [PerformanceProfile.DATA_SAVER]: {
    performanceProfile: PerformanceProfile.DATA_SAVER,
    audio: {
      preloadStrategy: 'none',
      progressiveLoading: true,
      cacheInServiceWorker: true,
      maxCacheSize: 100,
      maxConcurrentLoads: 1,
      prioritizePlayback: false,
      lowLatencyMode: false
    },
    web3: {
      batchTransactions: true,
      cacheResolution: 3600,
      offlineSupport: true,
      fallbackProviders: false,
      estimateGasAutomatically: false,
      maxRetries: 1,
      retryDelay: 10000
    },
    memory: {
      maxAudioBufferSize: 100,
      maxImageCacheSize: 50,
      aggressiveGC: true,
      monitorMemoryUsage: true,
      lowMemoryThreshold: 50,
      criticalMemoryThreshold: 25
    },
    serviceWorker: {
      enabled: true,
      scope: '/',
      updateInterval: 336,
      cacheDuration: 7,
      cacheAudio: true,
      cacheImages: true,
      cacheAPIs: true,
      cacheWeb3Responses: false,
      offlineSupport: true,
      backgroundSync: true
    },
    prefetchLinks: false,
    lazyLoadImages: true,
    lazyLoadThreshold: 0,
    useBrowserCache: true,
    useIndexedDB: true,
    monitorNetworkChanges: true,
    monitorBatteryStatus: false,
    adaptiveQuality: true,
    disableAnimationsOnLowPower: false,
    disableBackgroundProcessing: false,
    enableDebugMode: false
  }
};

/**
 * PerformanceOptimizer - Singleton class for managing performance optimizations
 * 
 * This class provides a comprehensive solution for optimizing application performance
 * including lazy loading, resource prioritization, service worker management,
 * memory optimization, and battery-aware optimizations.
 */
class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private config: PerformanceOptimizerConfig;
  private currentConnectionType: ConnectionType = ConnectionType.UNKNOWN;
  private currentPowerState: PowerState = PowerState.UNKNOWN;
  private memoryWarningCount: number = 0;
  private batteryLevel: number = 100;
  private isCharging: boolean = true;
  private isOnline: boolean = true;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private resourceLoadTimes: Map<string, number> = new Map();
  private resourcePriorities: Map<string, ResourcePriority> = new Map();
  private deferredOperations: Array<{
    operation: () => Promise<any>;
    priority: ResourcePriority;
    timeout?: number;
  }> = [];
  private isIdle: boolean = false;
  private idleCallbackId: number | null = null;
  private memoryMonitorInterval: NodeJS.Timeout | null = null;
  private batteryMonitorInterval: NodeJS.Timeout | null = null;
  private networkMonitorInterval: NodeJS.Timeout | null = null;
  private loadedComponents: Set<string> = new Set();
  private preloadedAudio: Set<string> = new Set();
  private pendingAudioLoads: Map<string, Promise<any>> = new Map();
  public isInitialized: boolean = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Default to medium performance profile
    this.config = DEFAULT_CONFIGS[PerformanceProfile.MEDIUM];
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Initialize the performance optimizer
   */
  public async init(config?: Partial<PerformanceOptimizerConfig>): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Detect device capabilities and set initial performance profile
    const detectedProfile = await this.detectPerformanceProfile();
    
    // Apply default config for detected profile
    this.config = {
      ...DEFAULT_CONFIGS[detectedProfile],
      ...config
    };

    // Initialize monitoring systems
    this.initMonitoring();

    // Register service worker if enabled
    if (this.config.serviceWorker.enabled && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      this.registerServiceWorker();
    }

    // Set up idle detection
    this.setupIdleDetection();

    // Mark as initialized
    this.isInitialized = true;

    // Log initialization
    if (this.config.enableDebugMode) {
      console.log('PerformanceOptimizer initialized with profile:', this.config.performanceProfile);
    }

    // Track initialization in analytics
    analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
      metricType: 'performance_optimizer_initialized',
      profile: this.config.performanceProfile,
      deviceMemory: this.getDeviceMemory(),
      connectionType: this.currentConnectionType,
      powerState: this.currentPowerState
    });
  }

  /**
   * Lazy load a React component with optimized loading strategy
   */
  public lazyLoadComponent<T>(
    factory: () => Promise<{ default: React.ComponentType<T> }>,
    options: LazyLoadOptions
  ): React.ComponentType<T> {
    const componentId = factory.toString();
    
    // Track component load request
    if (!this.loadedComponents.has(componentId)) {
      analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
        metricType: 'component_lazy_load_requested',
        componentId,
        priority: options.priority
      });
    }

    // Set default loading component
    const loadingComponent = options.loading || (() => null);

    // Configure dynamic import options
    const dynamicOptions: any = {
      loading: loadingComponent,
      ssr: options.ssr !== undefined ? options.ssr : false
    };

    // Preload component if high priority or explicitly requested
    if (options.preload || options.priority === ResourcePriority.CRITICAL || options.priority === ResourcePriority.HIGH) {
      // Use setTimeout to avoid blocking the main thread
      setTimeout(() => {
        factory().then(() => {
          this.loadedComponents.add(componentId);
          
          analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
            metricType: 'component_preloaded',
            componentId,
            priority: options.priority
          });
        });
      }, 0);
    }

    // Create and return the dynamic component
    return dynamic(factory, dynamicOptions);
  }

  /**
   * Optimize audio loading based on current performance profile
   */
  public optimizeAudioLoading(audioUrl: string, priority: ResourcePriority = ResourcePriority.MEDIUM): Promise<void> {
    // Check if already preloaded
    if (this.preloadedAudio.has(audioUrl)) {
      return Promise.resolve();
    }

    // Check if already being loaded
    if (this.pendingAudioLoads.has(audioUrl)) {
      return this.pendingAudioLoads.get(audioUrl)!;
    }

    // Start timing
    const startTime = performance.now();
    
    // Set resource priority
    this.resourcePriorities.set(audioUrl, priority);

    // Determine if we should preload based on priority and current profile
    const shouldPreload = 
      priority === ResourcePriority.CRITICAL || 
      (priority === ResourcePriority.HIGH && 
        (this.config.performanceProfile === PerformanceProfile.ULTRA || 
         this.config.performanceProfile === PerformanceProfile.HIGH));

    // If not preloading, just resolve
    if (!shouldPreload) {
      return Promise.resolve();
    }

    // Check if we can load more audio files
    if (this.pendingAudioLoads.size >= this.config.audio.maxConcurrentLoads) {
      // If we're at capacity, only proceed if this is critical
      if (priority !== ResourcePriority.CRITICAL) {
        return Promise.resolve();
      }
      
      // Otherwise, cancel the lowest priority load
      let lowestPriorityUrl: string | null = null;
      let lowestPriority = ResourcePriority.CRITICAL;
      
      for (const [url, _] of this.pendingAudioLoads) {
        const urlPriority = this.resourcePriorities.get(url) || ResourcePriority.MEDIUM;
        if (this.getPriorityValue(urlPriority) < this.getPriorityValue(lowestPriority)) {
          lowestPriority = urlPriority;
          lowestPriorityUrl = url;
        }
      }
      
      // Cancel lowest priority load if found
      if (lowestPriorityUrl) {
        audioManager.cancelLoadAudio(lowestPriorityUrl);
        this.pendingAudioLoads.delete(lowestPriorityUrl);
        
        if (this.config.enableDebugMode) {
          console.log(`Cancelled loading of lower priority audio: ${lowestPriorityUrl}`);
        }
      }
    }

    // Create load promise
    const loadPromise = new Promise<void>((resolve, reject) => {
      // Use progressive loading if enabled
      audioManager.loadAudio(audioUrl, this.config.audio.progressiveLoading ? (progress) => {
        // Track progress for high priority audio
        if (priority === ResourcePriority.CRITICAL || priority === ResourcePriority.HIGH) {
          analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
            metricType: 'audio_load_progress',
            url: audioUrl,
            progress,
            priority
          });
        }
      } : undefined).then(() => {
        // Record load time
        const loadTime = performance.now() - startTime;
        this.resourceLoadTimes.set(audioUrl, loadTime);
        
        // Mark as preloaded
        this.preloadedAudio.add(audioUrl);
        this.pendingAudioLoads.delete(audioUrl);
        
        // Track successful load
        analyticsManager.trackPerformance(
          PerformanceMetricType.AUDIO_LOAD_TIME,
          loadTime,
          { url: audioUrl, priority }
        );
        
        resolve();
      }).catch((error) => {
        this.pendingAudioLoads.delete(audioUrl);
        console.error(`Failed to preload audio: ${audioUrl}`, error);
        reject(error);
      });
    });

    // Store the promise
    this.pendingAudioLoads.set(audioUrl, loadPromise);
    
    return loadPromise;
  }

  /**
   * Optimize Web3 operations based on current performance profile
   */
  public optimizeWeb3Operation<T>(
    operation: () => Promise<T>,
    priority: ResourcePriority = ResourcePriority.MEDIUM,
    options: {
      cacheKey?: string;
      cacheDuration?: number;
      retries?: number;
      offlineSupport?: boolean;
    } = {}
  ): Promise<T> {
    // Start timing
    const startTime = performance.now();
    
    // Check if we're offline and operation doesn't support offline mode
    if (!this.isOnline && !(options.offlineSupport || this.config.web3.offlineSupport)) {
      return Promise.reject(new Error('Cannot perform Web3 operation while offline'));
    }
    
    // Check if we have a cached result
    if (options.cacheKey && typeof localStorage !== 'undefined') {
      try {
        const cachedData = localStorage.getItem(`web3_cache_${options.cacheKey}`);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const cacheDuration = options.cacheDuration || this.config.web3.cacheResolution;
          const isValid = (Date.now() - timestamp) < cacheDuration * 1000;
          
          if (isValid) {
            // Track cache hit
            analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
              metricType: 'web3_cache_hit',
              cacheKey: options.cacheKey,
              age: (Date.now() - timestamp) / 1000
            });
            
            return Promise.resolve(data);
          }
        }
      } catch (e) {
        console.warn('Error reading from Web3 cache:', e);
      }
    }
    
    // For low priority operations on low battery, defer if not critical
    if (
      priority !== ResourcePriority.CRITICAL &&
      (this.currentPowerState === PowerState.BATTERY_LOW || 
       this.currentPowerState === PowerState.BATTERY_CRITICAL) &&
      this.config.performanceProfile !== PerformanceProfile.ULTRA
    ) {
      return new Promise((resolve, reject) => {
        this.deferredOperations.push({
          operation: () => {
            return operation().then(resolve).catch(reject);
          },
          priority,
          timeout: 30000 // 30 second timeout for Web3 operations
        });
      });
    }
    
    // Execute the operation with retries
    const maxRetries = options.retries !== undefined ? options.retries : this.config.web3.maxRetries;
    const retryDelay = this.config.web3.retryDelay;
    
    const executeWithRetry = (attempt: number): Promise<T> => {
      return operation().then(result => {
        // Cache the result if caching is enabled
        if (options.cacheKey && typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem(`web3_cache_${options.cacheKey}`, JSON.stringify({
              data: result,
              timestamp: Date.now()
            }));
          } catch (e) {
            console.warn('Error writing to Web3 cache:', e);
          }
        }
        
        // Track performance
        const duration = performance.now() - startTime;
        analyticsManager.trackPerformance(
          PerformanceMetricType.WEB3_TRANSACTION_TIME,
          duration,
          { 
            cacheKey: options.cacheKey,
            attempts: attempt,
            priority
          }
        );
        
        return result;
      }).catch(error => {
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, attempt - 1);
          
          if (this.config.enableDebugMode) {
            console.log(`Web3 operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          }
          
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(executeWithRetry(attempt + 1));
            }, delay);
          });
        }
        
        // Track failure
        analyticsManager.track(AnalyticsEventType.ERROR_OCCURRED, {
          errorType: 'web3_operation_failed',
          attempts: attempt,
          error: error.message,
          priority
        });
        
        throw error;
      });
    };
    
    return executeWithRetry(1);
  }

  /**
   * Optimize image loading with lazy loading and priority
   */
  public optimizeImageLoading(
    imageUrl: string,
    priority: ResourcePriority = ResourcePriority.MEDIUM
  ): { src: string; loading: 'eager' | 'lazy'; fetchPriority: 'high' | 'auto' | 'low' } {
    // Determine loading strategy based on priority and performance profile
    let loading: 'eager' | 'lazy' = 'lazy';
    let fetchPriority: 'high' | 'auto' | 'low' = 'auto';
    
    if (priority === ResourcePriority.CRITICAL) {
      loading = 'eager';
      fetchPriority = 'high';
    } else if (priority === ResourcePriority.HIGH) {
      loading = this.config.performanceProfile === PerformanceProfile.LOW || 
                this.config.performanceProfile === PerformanceProfile.BATTERY_SAVER ? 'lazy' : 'eager';
      fetchPriority = 'high';
    } else if (priority === ResourcePriority.LOW || priority === ResourcePriority.LAZY) {
      fetchPriority = 'low';
    }
    
    // If lazy loading is disabled, override
    if (!this.config.lazyLoadImages) {
      loading = 'eager';
    }
    
    return {
      src: imageUrl,
      loading,
      fetchPriority
    };
  }

  /**
   * Register and manage service worker
   */
  private async registerServiceWorker(): Promise<void> {
    if (!this.config.serviceWorker.enabled || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: this.config.serviceWorker.scope
      });
      
      this.serviceWorkerRegistration = registration;
      
      // Track successful registration
      analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
        metricType: 'service_worker_registered',
        scope: this.config.serviceWorker.scope
      });
      
      // Set up update check interval
      if (this.config.serviceWorker.updateInterval > 0) {
        setInterval(() => {
          registration.update().catch(error => {
            console.warn('Service worker update failed:', error);
          });
        }, this.config.serviceWorker.updateInterval * 60 * 60 * 1000); // Convert hours to ms
      }
      
      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed but waiting to activate
              // Notify user of update
              if (this.config.enableDebugMode) {
                console.log('New service worker installed and waiting to activate');
              }
            }
          });
        }
      });
      
      // Configure service worker messaging
      if (navigator.serviceWorker.controller) {
        this.setupServiceWorkerMessaging();
      }
    } catch (error) {
      console.error('Service worker registration failed:', error);
      
      // Track failure
      analyticsManager.track(AnalyticsEventType.ERROR_OCCURRED, {
        errorType: 'service_worker_registration_failed',
        error: (error as Error).message
      });
    }
  }

  /**
   * Set up messaging with service worker
   */
  private setupServiceWorkerMessaging(): void {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      const message = event.data;
      
      if (!message || !message.type) {
        return;
      }
      
      switch (message.type) {
        case 'CACHE_UPDATED':
          // Service worker has updated cache
          if (this.config.enableDebugMode) {
            console.log('Service worker cache updated:', message.payload);
          }
          break;
          
        case 'CACHE_ERROR':
          // Error in service worker cache
          console.warn('Service worker cache error:', message.payload);
          break;
          
        case 'OFFLINE_READY':
          // App is ready for offline use
          if (this.config.enableDebugMode) {
            console.log('App is ready for offline use');
          }
          break;
          
        case 'RESOURCE_CACHED':
          // A resource has been cached
          const { url, type, size } = message.payload;
          
          if (type === 'audio') {
            this.preloadedAudio.add(url);
          }
          
          if (this.config.enableDebugMode) {
            console.log(`Resource cached: ${url} (${type}, ${size} bytes)`);
          }
          break;
      }
    });
    
    // Send initial configuration to service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CONFIGURE',
        payload: {
          cacheAudio: this.config.serviceWorker.cacheAudio,
          cacheImages: this.config.serviceWorker.cacheImages,
          cacheAPIs: this.config.serviceWorker.cacheAPIs,
          cacheWeb3Responses: this.config.serviceWorker.cacheWeb3Responses,
          cacheDuration: this.config.serviceWorker.cacheDuration,
          offlineSupport: this.config.serviceWorker.offlineSupport,
          backgroundSync: this.config.serviceWorker.backgroundSync,
          performanceProfile: this.config.performanceProfile
        }
      });
    }
  }

  /**
   * Initialize monitoring systems
   */
  private initMonitoring(): void {
    // Monitor memory usage
    if (this.config.memory.monitorMemoryUsage) {
      this.startMemoryMonitoring();
    }
    
    // Monitor battery status
    if (this.config.monitorBatteryStatus) {
      this.startBatteryMonitoring();
    }
    
    // Monitor network status
    if (this.config.monitorNetworkChanges) {
      this.startNetworkMonitoring();
    }
    
    // Listen for memory warnings from audio manager
    audioManager.on('memory:warning', this.handleMemoryWarning.bind(this));
  }

  /**
   * Start memory usage monitoring
   */
  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined' || this.memoryMonitorInterval) {
      return;
    }
    
    // Check memory usage every 30 seconds
    this.memoryMonitorInterval = setInterval(() => {
      const memoryInfo = this.getMemoryInfo();
      
      if (!memoryInfo) {
        return;
      }
      
      // Check if memory usage is above thresholds
      if (memoryInfo.usedJSHeapSize > this.config.memory.criticalMemoryThreshold * 1024 * 1024) {
        this.handleCriticalMemory();
      } else if (memoryInfo.usedJSHeapSize > this.config.memory.lowMemoryThreshold * 1024 * 1024) {
        this.handleLowMemory();
      }
    }, 30000);
  }

  /**
   * Start battery status monitoring
   */
  private startBatteryMonitoring(): void {
    if (typeof navigator === 'undefined' || this.batteryMonitorInterval) {
      return;
    }
    
    // Use Battery API if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        // Update initial state
        this.batteryLevel = battery.level * 100;
        this.isCharging = battery.charging;
        this.updatePowerState();
        
        // Listen for battery events
        battery.addEventListener('levelchange', () => {
          this.batteryLevel = battery.level * 100;
          this.updatePowerState();
        });
        
        battery.addEventListener('chargingchange', () => {
          this.isCharging = battery.charging;
          this.updatePowerState();
        });
      }).catch(() => {
        // Battery API not available, use interval as fallback
        this.startBatteryFallbackMonitoring();
      });
    } else {
      // Battery API not available, use interval as fallback
      this.startBatteryFallbackMonitoring();
    }
  }

  /**
   * Fallback battery monitoring using device motion as proxy
   */
  private startBatteryFallbackMonitoring(): void {
    // Check every minute for device activity patterns
    this.batteryMonitorInterval = setInterval(() => {
      // This is a very rough approximation
      // In a real app, we would use more sophisticated heuristics
      const now = new Date();
      const hour = now.getHours();
      
      // Assume charging at night (very rough heuristic)
      this.isCharging = (hour >= 22 || hour <= 6);
      
      // Assume battery level based on time of day (very rough heuristic)
      if (hour < 10) {
        this.batteryLevel = 80;
      } else if (hour < 14) {
        this.batteryLevel = 60;
      } else if (hour < 18) {
        this.batteryLevel = 40;
      } else {
        this.batteryLevel = 20;
      }
      
      this.updatePowerState();
    }, 60000);
  }

  /**
   * Start network status monitoring
   */
  private startNetworkMonitoring(): void {
    if (typeof navigator === 'undefined' || this.networkMonitorInterval) {
      return;
    }
    
    // Update initial state
    this.isOnline = navigator.onLine;
    this.updateConnectionType();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateConnectionType();
      
      // Process deferred operations when back online
      this.processDeferredOperations();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.currentConnectionType = ConnectionType.OFFLINE;
      
      // Notify analytics
      analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
        metricType: 'connection_status_change',
        status: 'offline'
      });
    });
    
    // Check connection type periodically
    this.networkMonitorInterval = setInterval(() => {
      this.updateConnectionType();
    }, 60000);
  }

  /**
   * Update current connection type
   */
  private updateConnectionType(): void {
    if (typeof navigator === 'undefined') {
      return;
    }
    
    if (!this.isOnline) {
      this.currentConnectionType = ConnectionType.OFFLINE;
      return;
    }
    
    // Use Network Information API if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        switch (connection.effectiveType) {
          case 'slow-2g':
            this.currentConnectionType = ConnectionType.SLOW_2G;
            break;
          case '2g':
            this.currentConnectionType = ConnectionType.CELLULAR_2G;
            break;
          case '3g':
            this.currentConnectionType = ConnectionType.CELLULAR_3G;
            break;
          case '4g':
            this.currentConnectionType = ConnectionType.CELLULAR_4G;
            break;
          default:
            if (connection.type === 'ethernet') {
              this.currentConnectionType = ConnectionType.ETHERNET;
            } else if (connection.type === 'wifi') {
              this.currentConnectionType = ConnectionType.WIFI;
            } else {
              this.currentConnectionType = ConnectionType.UNKNOWN;
            }
        }
        
        // Update performance profile based on connection
        this.updatePerformanceProfile();
        
        // Track connection change
        analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
          metricType: 'connection_type_change',
          connectionType: this.currentConnectionType,
          downlinkSpeed: connection.downlink
        });
        
        return;
      }
    }
    
    // Fallback: estimate connection type based on response times
    // This would be implemented in a real app with ping tests
    this.currentConnectionType = ConnectionType.UNKNOWN;
  }

  /**
   * Update current power state
   */
  private updatePowerState(): void {
    if (this.isCharging) {
      this.currentPowerState = PowerState.CHARGING;
    } else if (this.batteryLevel <= 10) {
      this.currentPowerState = PowerState.BATTERY_CRITICAL;
    } else if (this.batteryLevel <= 20) {
      this.currentPowerState = PowerState.BATTERY_LOW;
    } else if (this.batteryLevel <= 50) {
      this.currentPowerState = PowerState.BATTERY_MEDIUM;
    } else {
      this.currentPowerState = PowerState.BATTERY_HIGH;
    }
    
    // Update performance profile based on power state
    this.updatePerformanceProfile();
    
    // Track power state change
    analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
      metricType: 'power_state_change',
      powerState: this.currentPowerState,
      batteryLevel: this.batteryLevel,
      isCharging: this.isCharging
    });
  }

  /**
   * Update performance profile based on device state
   */
  private updatePerformanceProfile(): void {
    // Don't update if user has explicitly set a profile
    if (this.config.performanceProfile === PerformanceProfile.DATA_SAVER) {
      return;
    }
    
    let newProfile: PerformanceProfile;
    
    // Determine profile based on power state
    if (this.currentPowerState === PowerState.BATTERY_CRITICAL) {
      newProfile = PerformanceProfile.BATTERY_SAVER;
    } else if (this.currentPowerState === PowerState.BATTERY_LOW) {
      newProfile = PerformanceProfile.LOW;
    } else if (this.currentConnectionType === ConnectionType.SLOW_2G || 
               this.currentConnectionType === ConnectionType.CELLULAR_2G) {
      newProfile = PerformanceProfile.DATA_SAVER;
    } else if (this.currentConnectionType === ConnectionType.CELLULAR_3G) {
      newProfile = PerformanceProfile.LOW;
    } else if (this.currentPowerState === PowerState.CHARGING && 
              (this.currentConnectionType === ConnectionType.WIFI || 
               this.currentConnectionType === ConnectionType.ETHERNET)) {
      newProfile = PerformanceProfile.ULTRA;
    } else if (this.currentPowerState === PowerState.BATTERY_HIGH && 
              (this.currentConnectionType === ConnectionType.WIFI || 
               this.currentConnectionType === ConnectionType.ETHERNET || 
               this.currentConnectionType === ConnectionType.CELLULAR_4G)) {
      newProfile = PerformanceProfile.HIGH;
    } else {
      newProfile = PerformanceProfile.MEDIUM;
    }
    
    // Only update if profile has changed
    if (newProfile !== this.config.performanceProfile) {
      const oldProfile = this.config.performanceProfile;
      
      // Apply new profile configuration
      this.config = {
        ...DEFAULT_CONFIGS[newProfile],
        serviceWorker: this.config.serviceWorker // Keep service worker config
      };
      
      if (this.config.enableDebugMode) {
        console.log(`Performance profile changed from ${oldProfile} to ${newProfile}`);
      }
      
      // Track profile change
      analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
        metricType: 'performance_profile_change',
        oldProfile,
        newProfile,
        reason: this.currentPowerState === PowerState.BATTERY_CRITICAL || 
                this.currentPowerState === PowerState.BATTERY_LOW ? 'battery' : 
                this.currentConnectionType === ConnectionType.SLOW_2G || 
                this.currentConnectionType === ConnectionType.CELLULAR_2G ||
                this.currentConnectionType === ConnectionType.CELLULAR_3G ? 'connection' : 'optimal'
      });
    }
  }

  /**
   * Handle low memory condition
   */
  private handleLowMemory(): void {
    // Clear non-essential caches
    this.clearImageCache();
    
    // Reduce audio buffer cache
    audioManager.cleanup();
    
    // Force garbage collection if supported
    this.forceGarbageCollection();
    
    // Track low memory event
    analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
      metricType: 'low_memory_detected',
      memoryUsage: this.getMemoryInfo()
    });
  }

  /**
   * Handle critical memory condition
   */
  private handleCriticalMemory(): void {
    // Aggressive cleanup
    this.handleLowMemory();
    
    // Clear all caches
    this.clearAllCaches();
    
    // Disable non-essential features
    if (this.config.performanceProfile !== PerformanceProfile.LOW && 
        this.config.performanceProfile !== PerformanceProfile.BATTERY_SAVER) {
      this.config = DEFAULT_CONFIGS[PerformanceProfile.LOW];
    }
    
    // Track critical memory event
    analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
      metricType: 'critical_memory_detected',
      memoryUsage: this.getMemoryInfo(),
      memoryWarningCount: ++this.memoryWarningCount
    });
    
    // Show warning if repeated critical memory
    if (this.memoryWarningCount >= 3) {
      console.warn('Critical memory pressure detected multiple times. Consider closing other apps or restarting the browser.');
    }
  }

  /**
   * Handle memory warning from audio manager
   */
  private handleMemoryWarning(data: any): void {
    if (this.config.enableDebugMode) {
      console.warn('Memory warning from audio manager:', data);
    }
    
    // Reduce audio buffer cache
    this.clearOldestAudioCache(5);
    
    // Track warning
    analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
      metricType: 'audio_memory_warning',
      usedMemory: data.used,
      threshold: data.threshold
    });
  }

  /**
   * Clear oldest audio cache entries
   */
  private clearOldestAudioCache(count: number): void {
    // This would remove the oldest entries from the audio cache
    // In a real implementation, we would track access times
    
    // For now, just notify the audio manager to clear its cache
    audioManager.cleanup();
  }

  /**
   * Clear image cache
   */
  private clearImageCache(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Clear image cache from memory
    // This is a simplified implementation
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      if (!isElementInViewport(img as HTMLElement)) {
        (img as HTMLImageElement).src = '';
      }
    });
    
    // Helper function to check if element is in viewport
    function isElementInViewport(el: HTMLElement) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
  }

  /**
   * Clear all caches
   */
  private clearAllCaches(): void {
    // Clear preloaded audio
    this.preloadedAudio.clear();
    
    // Clear image cache
    this.clearImageCache();
    
    // Clear service worker caches if available
    if (this.serviceWorkerRegistration && 'caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      }).catch(error => {
        console.warn('Error clearing caches:', error);
      });
    }
    
    // Clear local storage cache (except essential items)
    if (typeof localStorage !== 'undefined') {
      try {
        // Keep only essential items
        const essentialKeys = ['gigavibe_user_id', 'gigavibe_anonymous_id', 'gigavibe_consent'];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !essentialKeys.includes(key) && key.startsWith('web3_cache_')) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.warn('Error clearing localStorage:', e);
      }
    }
  }

  /**
   * Force garbage collection if supported
   */
  private forceGarbageCollection(): void {
    if (this.config.memory.aggressiveGC) {
      // There's no standard way to force GC in JavaScript
      // This is a hack that might help trigger GC in some browsers
      try {
        if (typeof window !== 'undefined' && (window as any).gc) {
          (window as any).gc();
        } else {
          const arr = [];
          for (let i = 0; i < 1000000; i++) {
            arr.push(new Array(10000).join('x'));
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }
  }

  /**
   * Get memory information
   */
  private getMemoryInfo(): any {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory;
    }
    return null;
  }

  /**
   * Get device memory in GB
   */
  private getDeviceMemory(): number {
    if (typeof navigator !== 'undefined' && (navigator as any).deviceMemory) {
      return (navigator as any).deviceMemory;
    }
    return 4; // Default assumption: 4GB
  }

  /**
   * Set up idle detection for processing deferred operations
   */
  private setupIdleDetection(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      const checkIdle = () => {
        this.isIdle = true;
        this.processDeferredOperations();
        
        // Schedule next check
        this.idleCallbackId = (window as any).requestIdleCallback(checkIdle);
      };
      
      this.idleCallbackId = (window as any).requestIdleCallback(checkIdle);
    } else {
      // Fallback to setTimeout
      const checkIdle = () => {
        // Simple heuristic: consider idle after 5 seconds of no user interaction
        this.isIdle = true;
        this.processDeferredOperations();
        
        // Schedule next check
        this.idleCallbackId = setTimeout(checkIdle, 5000) as any;
      };
      
      this.idleCallbackId = setTimeout(checkIdle, 5000) as any;
    }
    
    // Reset idle state on user interaction
    const resetIdle = () => {
      this.isIdle = false;
    };
    
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('touchstart', resetIdle);
    window.addEventListener('scroll', resetIdle);
  }

  /**
   * Process deferred operations during idle time
   */
  private processDeferredOperations(): void {
    if (!this.isIdle || this.deferredOperations.length === 0) {
      return;
    }
    
    // Sort operations by priority
    this.deferredOperations.sort((a, b) => {
      return this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority);
    });
    
    // Process highest priority operation
    const operation = this.deferredOperations.shift();
    
    if (operation) {
      if (this.config.enableDebugMode) {
        console.log(`Processing deferred operation with priority: ${operation.priority}`);
      }
      
      // Execute with timeout
      const timeoutId = operation.timeout ? 
        setTimeout(() => {
          console.warn(`Deferred operation timed out after ${operation.timeout}ms`);
        }, operation.timeout) : null;
      
      operation.operation().finally(() => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Process next operation in next idle period
        if (this.deferredOperations.length > 0) {
          setTimeout(() => {
            this.processDeferredOperations();
          }, 0);
        }
      });
    }
  }

  /**
   * Get numeric value for priority enum
   */
  private getPriorityValue(priority: ResourcePriority): number {
    switch (priority) {
      case ResourcePriority.CRITICAL:
        return 5;
      case ResourcePriority.HIGH:
        return 4;
      case ResourcePriority.MEDIUM:
        return 3;
      case ResourcePriority.LOW:
        return 2;
      case ResourcePriority.LAZY:
        return 1;
      default:
        return 0;
    }
  }

  /**
   * Detect appropriate performance profile based on device capabilities
   */
  private async detectPerformanceProfile(): Promise<PerformanceProfile> {
    if (typeof navigator === 'undefined') {
      return PerformanceProfile.MEDIUM;
    }
    
    // Check for battery saver mode
    const isPowerSaveMode = await this.isPowerSaveMode();
    if (isPowerSaveMode) {
      return PerformanceProfile.BATTERY_SAVER;
    }
    
    // Check for data saver mode
    const isDataSaveMode = await this.isDataSaveMode();
    if (isDataSaveMode) {
      return PerformanceProfile.DATA_SAVER;
    }
    
    // Check device memory
    const deviceMemory = this.getDeviceMemory();
    
    // Check processor cores
    const processorCores = navigator.hardwareConcurrency || 2;
    
    // Check connection type
    await this.updateConnectionType();
    
    // Determine profile based on device capabilities
    if (deviceMemory >= 8 && processorCores >= 8 && 
        (this.currentConnectionType === ConnectionType.WIFI || 
         this.currentConnectionType === ConnectionType.ETHERNET)) {
      return PerformanceProfile.ULTRA;
    } else if (deviceMemory >= 4 && processorCores >= 4 && 
              (this.currentConnectionType === ConnectionType.WIFI || 
               this.currentConnectionType === ConnectionType.ETHERNET || 
               this.currentConnectionType === ConnectionType.CELLULAR_4G)) {
      return PerformanceProfile.HIGH;
    } else if (deviceMemory >= 2 && processorCores >= 2) {
      return PerformanceProfile.MEDIUM;
    } else {
      return PerformanceProfile.LOW;
    }
  }

  /**
   * Check if device is in power save mode
   */
  private async isPowerSaveMode(): Promise<boolean> {
    if (typeof navigator === 'undefined') {
      return false;
    }
    
    // Use Battery API to check charging status
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        
        // If battery level is low and not charging, assume power save mode
        if (battery.level < 0.2 && !battery.charging) {
          return true;
        }
      } catch (e) {
        // Battery API not available
      }
    }
    
    // Check for specific browser APIs
    if ((navigator as any).powerSaveMode !== undefined) {
      return (navigator as any).powerSaveMode;
    }
    
    return false;
  }

  /**
   * Check if device is in data save mode
   */
  private async isDataSaveMode(): Promise<boolean> {
    if (typeof navigator === 'undefined') {
      return false;
    }
    
    // Use Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection && connection.saveData !== undefined) {
        return connection.saveData;
      }
    }
    
    return false;
  }

  /**
   * Get current performance profile
   */
  public getCurrentProfile(): PerformanceProfile {
    return this.config.performanceProfile;
  }

  /**
   * Set performance profile manually
   */
  public setPerformanceProfile(profile: PerformanceProfile): void {
    const oldProfile = this.config.performanceProfile;
    
    // Apply new profile configuration
    this.config = {
      ...DEFAULT_CONFIGS[profile],
      serviceWorker: this.config.serviceWorker // Keep service worker config
    };
    
    // Track profile change
    analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
      metricType: 'performance_profile_change',
      oldProfile,
      newProfile: profile,
      reason: 'manual'
    });
    
    if (this.config.enableDebugMode) {
      console.log(`Performance profile manually set to ${profile}`);
    }
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    // Clear intervals
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = null;
    }
    
    if (this.batteryMonitorInterval) {
      clearInterval(this.batteryMonitorInterval);
      this.batteryMonitorInterval = null;
    }
    
    if (this.networkMonitorInterval) {
      clearInterval(this.networkMonitorInterval);
      this.networkMonitorInterval = null;
    }
    
    // Clear idle callback
    if (this.idleCallbackId !== null) {
      if ('cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(this.idleCallbackId);
      } else {
        clearTimeout(this.idleCallbackId);
      }
      this.idleCallbackId = null;
    }
    
    // Clear audio resources
    audioManager.cleanup();
    
    // Clear caches
    this.preloadedAudio.clear();
    this.pendingAudioLoads.clear();
    this.resourceLoadTimes.clear();
    this.resourcePriorities.clear();
    
    // Track cleanup
    analyticsManager.track(AnalyticsEventType.PERFORMANCE_METRIC, {
      metricType: 'performance_optimizer_cleanup'
    });
  }
}

/**
 * React hook for using the performance optimizer in components
 */
export function usePerformanceOptimizer() {
  const [profile, setProfile] = useState<PerformanceProfile>(PerformanceProfile.MEDIUM);
  const optimizer = PerformanceOptimizer.getInstance();
  
  useEffect(() => {
    // Initialize the optimizer if not already initialized
    if (!optimizer.isInitialized) {
      optimizer.init().catch(error => {
        console.error('Failed to initialize performance optimizer:', error);
      });
    }
    
    // Get current profile
    setProfile(optimizer.getCurrentProfile());
    
    // Set up interval to check for profile changes
    const interval = setInterval(() => {
      const currentProfile = optimizer.getCurrentProfile();
      if (currentProfile !== profile) {
        setProfile(currentProfile);
      }
    }, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return {
    profile,
    setProfile: (newProfile: PerformanceProfile) => {
      optimizer.setPerformanceProfile(newProfile);
      setProfile(newProfile);
    },
    optimizeImage: (url: string, priority: ResourcePriority = ResourcePriority.MEDIUM) => 
      optimizer.optimizeImageLoading(url, priority),
    optimizeAudio: (url: string, priority: ResourcePriority = ResourcePriority.MEDIUM) => 
      optimizer.optimizeAudioLoading(url, priority),
    lazyLoadComponent: <T>(factory: () => Promise<{ default: React.ComponentType<T> }>, options: LazyLoadOptions) => 
      optimizer.lazyLoadComponent(factory, options)
  };
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Export default for testing
export default PerformanceOptimizer;
