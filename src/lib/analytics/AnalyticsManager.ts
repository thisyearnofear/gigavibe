import { v4 as uuidv4 } from 'uuid';

/**
 * Analytics event types specific to Gigavibe
 */
export enum AnalyticsEventType {
  // User journey events
  APP_LOADED = 'app_loaded',
  USER_SIGNUP = 'user_signup',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  ONBOARDING_STARTED = 'onboarding_started',
  ONBOARDING_COMPLETED = 'onboarding_completed',
  ONBOARDING_STEP_COMPLETED = 'onboarding_step_completed',
  
  // Challenge flow events
  CHALLENGE_VIEWED = 'challenge_viewed',
  CHALLENGE_STARTED = 'challenge_started',
  RECORDING_STARTED = 'recording_started',
  RECORDING_COMPLETED = 'recording_completed',
  RECORDING_ABANDONED = 'recording_abandoned',
  SELF_RATING_SUBMITTED = 'self_rating_submitted',
  PERFORMANCE_SUBMITTED = 'performance_submitted',
  
  // Social engagement events
  PERFORMANCE_VIEWED = 'performance_viewed',
  PERFORMANCE_RATED = 'performance_rated',
  PERFORMANCE_SHARED = 'performance_shared',
  PERFORMANCE_COMMENTED = 'performance_commented',
  FIRST_VOTE_CAST = 'first_vote_cast',
  
  // Web3 events
  WALLET_CONNECTED = 'wallet_connected',
  FARCASTER_CONNECTED = 'farcaster_connected',
  PERFORMANCE_COIN_MINTED = 'performance_coin_minted',
  PERFORMANCE_COIN_TRADED = 'performance_coin_traded',
  
  // Viral metrics
  INVITE_SENT = 'invite_sent',
  INVITE_ACCEPTED = 'invite_accepted',
  REALITY_GAP_REVEALED = 'reality_gap_revealed',
  
  // Error events
  ERROR_OCCURRED = 'error_occurred',
  
  // Performance metrics
  PERFORMANCE_METRIC = 'performance_metric',
}

/**
 * Properties common to all analytics events
 */
interface BaseAnalyticsEvent {
  eventType: AnalyticsEventType;
  timestamp: number;
  sessionId: string;
  anonymousId: string;
  userId?: string;
  farcasterFid?: string;
  walletAddress?: string;
  source: 'client' | 'server';
  clientInfo?: {
    userAgent: string;
    screenSize: string;
    locale: string;
    timeZone: string;
    referrer: string;
  };
  appVersion?: string;
  consentCategories: string[];
}

/**
 * Custom properties for specific events
 */
export interface AnalyticsEventProperties {
  [key: string]: any;
}

/**
 * Complete analytics event
 */
export interface AnalyticsEvent extends BaseAnalyticsEvent {
  properties: AnalyticsEventProperties;
}

/**
 * Configuration options for the analytics manager
 */
export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  batchSize: number;
  batchInterval: number; // milliseconds
  endpoint: string;
  apiKey?: string;
  samplingRate: number; // 0-1, percentage of events to track
  consentRequired: boolean;
  defaultConsentCategories: string[];
  anonymizeIp: boolean;
  persistentStorage: boolean;
  performanceMonitoring: boolean;
  errorTracking: boolean;
  autoTrackPageViews: boolean;
  autoTrackClicks: boolean;
  destinations: {
    googleAnalytics?: {
      enabled: boolean;
      measurementId?: string;
    };
    mixpanel?: {
      enabled: boolean;
      projectToken?: string;
    };
    amplitude?: {
      enabled: boolean;
      apiKey?: string;
    };
    custom?: {
      enabled: boolean;
      handler?: (event: AnalyticsEvent) => Promise<void>;
    };
  };
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: true,
  debug: false,
  batchSize: 10,
  batchInterval: 5000,
  endpoint: '/api/analytics/track',
  samplingRate: 1.0,
  consentRequired: true,
  defaultConsentCategories: ['essential'],
  anonymizeIp: true,
  persistentStorage: true,
  performanceMonitoring: true,
  errorTracking: true,
  autoTrackPageViews: true,
  autoTrackClicks: false,
  destinations: {
    googleAnalytics: {
      enabled: false,
    },
    mixpanel: {
      enabled: false,
    },
    amplitude: {
      enabled: false,
    },
    custom: {
      enabled: true,
    },
  },
};

/**
 * Consent categories for GDPR compliance
 */
export enum ConsentCategory {
  ESSENTIAL = 'essential',
  PERFORMANCE = 'performance',
  FUNCTIONAL = 'functional',
  TARGETING = 'targeting',
  SOCIAL = 'social',
}

/**
 * Performance metric types
 */
export enum PerformanceMetricType {
  PAGE_LOAD = 'page_load',
  FIRST_CONTENTFUL_PAINT = 'first_contentful_paint',
  LARGEST_CONTENTFUL_PAINT = 'largest_contentful_paint',
  FIRST_INPUT_DELAY = 'first_input_delay',
  CUMULATIVE_LAYOUT_SHIFT = 'cumulative_layout_shift',
  TIME_TO_INTERACTIVE = 'time_to_interactive',
  AUDIO_LOAD_TIME = 'audio_load_time',
  RECORDING_PROCESSING_TIME = 'recording_processing_time',
  API_RESPONSE_TIME = 'api_response_time',
  IPFS_UPLOAD_TIME = 'ipfs_upload_time',
  IPFS_DOWNLOAD_TIME = 'ipfs_download_time',
  WEB3_TRANSACTION_TIME = 'web3_transaction_time',
}

/**
 * Analytics Manager - Singleton class for tracking analytics events
 * 
 * This class provides a comprehensive analytics solution for tracking
 * user behavior, performance metrics, and business events. It supports
 * batching, consent management, and multiple analytics destinations.
 */
class AnalyticsManager {
  private static instance: AnalyticsManager;
  private config: AnalyticsConfig;
  private sessionId: string;
  private anonymousId: string;
  private userId?: string;
  private farcasterFid?: string;
  private walletAddress?: string;
  private eventQueue: AnalyticsEvent[] = [];
  private batchInterval?: NodeJS.Timeout;
  private consentCategories: Set<string>;
  private isInitialized: boolean = false;
  private pageLoadTimestamp: number = 0;
  private lastPageUrl: string = '';
  private performanceObserver?: PerformanceObserver;
  private apiTimings: Map<string, number> = new Map();
  private realityGapData: {
    selfRatings: number[];
    communityRatings: number[];
    gaps: number[];
  } = {
    selfRatings: [],
    communityRatings: [],
    gaps: [],
  };
  private viralCoefficients: {
    invitesSent: number;
    invitesAccepted: number;
    userAcquisitionSource: Record<string, number>;
  } = {
    invitesSent: 0,
    invitesAccepted: 0,
    userAcquisitionSource: {},
  };
  private recordingCompletionData: {
    started: number;
    completed: number;
    abandoned: number;
  } = {
    started: 0,
    completed: 0,
    abandoned: 0,
  };
  private timeToFirstVote: number[] = [];

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.config = DEFAULT_CONFIG;
    this.sessionId = this.generateSessionId();
    this.anonymousId = this.getOrCreateAnonymousId();
    this.consentCategories = new Set(this.config.defaultConsentCategories);
    this.pageLoadTimestamp = Date.now();
    
    // Initialize event queue
    this.eventQueue = [];
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * Initialize the analytics manager
   */
  public init(config: Partial<AnalyticsConfig> = {}): void {
    if (this.isInitialized) {
      return;
    }

    // Merge provided config with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      destinations: {
        ...DEFAULT_CONFIG.destinations,
        ...config.destinations,
      },
    };

    // Start batch processing
    this.startBatchProcessing();

    // Set up performance monitoring if enabled
    if (this.config.performanceMonitoring && typeof window !== 'undefined') {
      this.setupPerformanceMonitoring();
    }

    // Set up auto-tracking if enabled
    if (this.config.autoTrackPageViews && typeof window !== 'undefined') {
      this.setupPageViewTracking();
    }

    if (this.config.autoTrackClicks && typeof window !== 'undefined') {
      this.setupClickTracking();
    }

    // Load stored consent if available
    this.loadStoredConsent();

    // Mark as initialized
    this.isInitialized = true;

    // Track initialization
    this.track(AnalyticsEventType.APP_LOADED, {
      config: this.sanitizeConfigForLogging(this.config),
    });

    if (this.config.debug) {
      console.log('Analytics initialized with config:', this.sanitizeConfigForLogging(this.config));
    }
  }

  /**
   * Set user identity
   */
  public identify(userId: string, traits: Record<string, any> = {}): void {
    this.userId = userId;

    // Store user ID if persistent storage is enabled
    if (this.config.persistentStorage && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('gigavibe_user_id', userId);
      } catch (e) {
        console.error('Failed to store user ID:', e);
      }
    }

    // Track identify event
    this.track(AnalyticsEventType.USER_LOGIN, {
      userId,
      ...traits,
    });
  }

  /**
   * Set Farcaster identity
   */
  public identifyFarcaster(fid: string, traits: Record<string, any> = {}): void {
    this.farcasterFid = fid;

    // Track Farcaster connection
    this.track(AnalyticsEventType.FARCASTER_CONNECTED, {
      farcasterFid: fid,
      ...traits,
    });
  }

  /**
   * Set wallet address
   */
  public identifyWallet(address: string, traits: Record<string, any> = {}): void {
    // Anonymize wallet address if needed
    this.walletAddress = this.config.anonymizeIp ? this.anonymizeWalletAddress(address) : address;

    // Track wallet connection
    this.track(AnalyticsEventType.WALLET_CONNECTED, {
      walletAddress: this.walletAddress,
      ...traits,
    });
  }

  /**
   * Track an analytics event
   */
  public track(
    eventType: AnalyticsEventType,
    properties: AnalyticsEventProperties = {}
  ): void {
    if (!this.config.enabled) {
      return;
    }

    // Apply sampling
    if (Math.random() > this.config.samplingRate) {
      return;
    }

    // Create event object
    const event: AnalyticsEvent = {
      eventType,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      anonymousId: this.anonymousId,
      userId: this.userId,
      farcasterFid: this.farcasterFid,
      walletAddress: this.walletAddress,
      source: typeof window !== 'undefined' ? 'client' : 'server',
      consentCategories: Array.from(this.consentCategories),
      properties,
    };

    // Add client info if available
    if (typeof window !== 'undefined') {
      event.clientInfo = {
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        locale: navigator.language,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer,
      };
      event.appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
    }

    // Update specific metrics based on event type
    this.updateMetricsForEvent(eventType, properties);

    // Add to queue
    this.eventQueue.push(event);

    // Process immediately if in debug mode
    if (this.config.debug) {
      console.log('Analytics event:', event);
      this.processQueue();
    }

    // Process immediately if queue exceeds batch size
    if (this.eventQueue.length >= this.config.batchSize) {
      this.processQueue();
    }
  }

  /**
   * Track a page view
   */
  public trackPageView(url: string, title?: string, referrer?: string): void {
    const properties: AnalyticsEventProperties = {
      url,
      title: title || (typeof document !== 'undefined' ? document.title : undefined),
      referrer: referrer || (typeof document !== 'undefined' ? document.referrer : undefined),
      timeOnPreviousPage: this.lastPageUrl ? Date.now() - this.pageLoadTimestamp : 0,
    };

    this.lastPageUrl = url;
    this.pageLoadTimestamp = Date.now();

    this.track(AnalyticsEventType.APP_LOADED, properties);
  }

  /**
   * Track a performance metric
   */
  public trackPerformance(
    metricType: PerformanceMetricType,
    value: number,
    properties: AnalyticsEventProperties = {}
  ): void {
    this.track(AnalyticsEventType.PERFORMANCE_METRIC, {
      metricType,
      value,
      ...properties,
    });
  }

  /**
   * Track an API request timing
   */
  public trackApiTiming(endpoint: string, startTime: number): void {
    const duration = Date.now() - startTime;
    this.apiTimings.set(endpoint, duration);

    this.trackPerformance(PerformanceMetricType.API_RESPONSE_TIME, duration, {
      endpoint,
    });
  }

  /**
   * Track a Reality Gap measurement
   */
  public trackRealityGap(selfRating: number, communityRating: number, performanceId: string): void {
    const gap = selfRating - communityRating;
    
    // Store for aggregate analysis
    this.realityGapData.selfRatings.push(selfRating);
    this.realityGapData.communityRatings.push(communityRating);
    this.realityGapData.gaps.push(gap);

    this.track(AnalyticsEventType.REALITY_GAP_REVEALED, {
      performanceId,
      selfRating,
      communityRating,
      gap,
      gapAbsolute: Math.abs(gap),
      gapDirection: gap > 0 ? 'overconfident' : gap < 0 ? 'underconfident' : 'accurate',
    });
  }

  /**
   * Track viral invitation
   */
  public trackInvite(inviteType: string, recipientId?: string): void {
    this.viralCoefficients.invitesSent++;

    this.track(AnalyticsEventType.INVITE_SENT, {
      inviteType,
      recipientId,
    });
  }

  /**
   * Track invite acceptance
   */
  public trackInviteAccepted(inviteId: string, inviterId?: string): void {
    this.viralCoefficients.invitesAccepted++;
    
    // Track acquisition source
    const source = inviterId ? 'invite' : 'organic';
    this.viralCoefficients.userAcquisitionSource[source] = 
      (this.viralCoefficients.userAcquisitionSource[source] || 0) + 1;

    this.track(AnalyticsEventType.INVITE_ACCEPTED, {
      inviteId,
      inviterId,
    });
  }

  /**
   * Track first vote by a user
   */
  public trackFirstVote(userId: string, timeToFirstVote: number): void {
    this.timeToFirstVote.push(timeToFirstVote);

    this.track(AnalyticsEventType.FIRST_VOTE_CAST, {
      userId,
      timeToFirstVote,
    });
  }

  /**
   * Get aggregated Reality Gap metrics
   */
  public getRealityGapMetrics(): {
    averageGap: number;
    medianGap: number;
    gapDistribution: Record<string, number>;
    totalMeasurements: number;
  } {
    const gaps = this.realityGapData.gaps;
    
    if (gaps.length === 0) {
      return {
        averageGap: 0,
        medianGap: 0,
        gapDistribution: {},
        totalMeasurements: 0,
      };
    }

    // Calculate average
    const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    
    // Calculate median
    const sortedGaps = [...gaps].sort((a, b) => a - b);
    const midIndex = Math.floor(sortedGaps.length / 2);
    const medianGap = sortedGaps.length % 2 === 0
      ? (sortedGaps[midIndex - 1] + sortedGaps[midIndex]) / 2
      : sortedGaps[midIndex];
    
    // Calculate distribution
    const gapDistribution: Record<string, number> = {};
    gaps.forEach(gap => {
      const key = gap > 2 ? '>2'
        : gap > 1 ? '1-2'
        : gap > 0 ? '0-1'
        : gap > -1 ? '-1-0'
        : gap > -2 ? '-2--1'
        : '<-2';
      
      gapDistribution[key] = (gapDistribution[key] || 0) + 1;
    });
    
    return {
      averageGap,
      medianGap,
      gapDistribution,
      totalMeasurements: gaps.length,
    };
  }

  /**
   * Get viral coefficient metrics
   */
  public getViralCoefficient(): {
    k: number;
    invitesSent: number;
    invitesAccepted: number;
    conversionRate: number;
    acquisitionSources: Record<string, number>;
  } {
    const { invitesSent, invitesAccepted, userAcquisitionSource } = this.viralCoefficients;
    
    // Calculate K-factor (viral coefficient)
    // K = number of invites sent per user * conversion rate
    const conversionRate = invitesSent > 0 ? invitesAccepted / invitesSent : 0;
    const k = conversionRate * invitesSent;
    
    return {
      k,
      invitesSent,
      invitesAccepted,
      conversionRate,
      acquisitionSources: userAcquisitionSource,
    };
  }

  /**
   * Get recording completion metrics
   */
  public getRecordingCompletionMetrics(): {
    completionRate: number;
    abandonmentRate: number;
    started: number;
    completed: number;
    abandoned: number;
  } {
    const { started, completed, abandoned } = this.recordingCompletionData;
    
    return {
      completionRate: started > 0 ? completed / started : 0,
      abandonmentRate: started > 0 ? abandoned / started : 0,
      started,
      completed,
      abandoned,
    };
  }

  /**
   * Get time to first vote metrics
   */
  public getTimeToFirstVoteMetrics(): {
    averageTime: number;
    medianTime: number;
    distribution: Record<string, number>;
    totalUsers: number;
  } {
    const times = this.timeToFirstVote;
    
    if (times.length === 0) {
      return {
        averageTime: 0,
        medianTime: 0,
        distribution: {},
        totalUsers: 0,
      };
    }

    // Calculate average
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    // Calculate median
    const sortedTimes = [...times].sort((a, b) => a - b);
    const midIndex = Math.floor(sortedTimes.length / 2);
    const medianTime = sortedTimes.length % 2 === 0
      ? (sortedTimes[midIndex - 1] + sortedTimes[midIndex]) / 2
      : sortedTimes[midIndex];
    
    // Calculate distribution (in minutes)
    const distribution: Record<string, number> = {
      '<1min': 0,
      '1-5min': 0,
      '5-30min': 0,
      '30min-2hr': 0,
      '2hr-1day': 0,
      '>1day': 0,
    };
    
    times.forEach(time => {
      const minutes = time / (1000 * 60);
      
      if (minutes < 1) distribution['<1min']++;
      else if (minutes < 5) distribution['1-5min']++;
      else if (minutes < 30) distribution['5-30min']++;
      else if (minutes < 120) distribution['30min-2hr']++;
      else if (minutes < 1440) distribution['2hr-1day']++;
      else distribution['>1day']++;
    });
    
    return {
      averageTime,
      medianTime,
      distribution,
      totalUsers: times.length,
    };
  }

  /**
   * Update consent preferences
   */
  public updateConsent(categories: ConsentCategory[], granted: boolean): void {
    if (granted) {
      categories.forEach(category => this.consentCategories.add(category));
    } else {
      categories.forEach(category => {
        // Don't remove essential category
        if (category !== ConsentCategory.ESSENTIAL) {
          this.consentCategories.delete(category);
        }
      });
    }

    // Store consent if persistent storage is enabled
    if (this.config.persistentStorage && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('gigavibe_consent', JSON.stringify(Array.from(this.consentCategories)));
      } catch (e) {
        console.error('Failed to store consent preferences:', e);
      }
    }

    // Track consent update
    this.track(AnalyticsEventType.USER_SIGNUP, {
      consentCategories: Array.from(this.consentCategories),
      consentUpdated: true,
    });
  }

  /**
   * Check if a consent category is granted
   */
  public hasConsent(category: ConsentCategory): boolean {
    return this.consentCategories.has(category);
  }

  /**
   * Reset user data (for GDPR compliance)
   */
  public resetUserData(): void {
    // Generate new IDs
    this.anonymousId = uuidv4();
    this.sessionId = this.generateSessionId();
    
    // Clear user identifiers
    this.userId = undefined;
    this.farcasterFid = undefined;
    this.walletAddress = undefined;
    
    // Clear stored data if persistent storage is enabled
    if (this.config.persistentStorage && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('gigavibe_anonymous_id');
        localStorage.removeItem('gigavibe_user_id');
      } catch (e) {
        console.error('Failed to clear stored user data:', e);
      }
    }
    
    // Track reset event
    this.track(AnalyticsEventType.USER_LOGOUT, {
      dataReset: true,
    });
  }

  /**
   * Export user data (for GDPR compliance)
   */
  public exportUserData(): Record<string, any> {
    return {
      userId: this.userId,
      anonymousId: this.anonymousId,
      farcasterFid: this.farcasterFid,
      walletAddress: this.walletAddress,
      sessionId: this.sessionId,
      consentCategories: Array.from(this.consentCategories),
      realityGapData: this.realityGapData,
      recordingCompletionData: this.recordingCompletionData,
      timeToFirstVote: this.timeToFirstVote,
    };
  }

  /**
   * Process the event queue
   */
  private async processQueue(): Promise<void> {
    if (!this.config.enabled || this.eventQueue.length === 0) {
      return;
    }

    // Clone and clear the queue
    const events = [...this.eventQueue];
    this.eventQueue = [];

    // Process events for each destination
    try {
      const destinations = this.config.destinations;

      // Send to server endpoint
      if (this.config.endpoint) {
        await this.sendToEndpoint(events);
      }

      // Send to Google Analytics
      if (destinations.googleAnalytics?.enabled) {
        await this.sendToGoogleAnalytics(events);
      }

      // Send to Mixpanel
      if (destinations.mixpanel?.enabled) {
        await this.sendToMixpanel(events);
      }

      // Send to Amplitude
      if (destinations.amplitude?.enabled) {
        await this.sendToAmplitude(events);
      }

      // Send to custom handler
      if (destinations.custom?.enabled && destinations.custom.handler) {
        await destinations.custom.handler(events[0]); // Just an example, would need to loop through events
      }

      if (this.config.debug) {
        console.log('Processed analytics events:', events);
      }
    } catch (error) {
      console.error('Failed to process analytics events:', error);
      
      // Re-queue events on failure if not too many
      if (this.eventQueue.length < 100) {
        this.eventQueue = [...events, ...this.eventQueue];
      }
    }
  }

  /**
   * Send events to the server endpoint
   */
  private async sendToEndpoint(events: AnalyticsEvent[]): Promise<void> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'X-API-Key': this.config.apiKey } : {}),
        },
        body: JSON.stringify({ events }),
        keepalive: true, // Ensure the request completes even if the page is closed
      });

      if (!response.ok) {
        throw new Error(`Analytics API responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send analytics to endpoint:', error);
      throw error;
    }
  }

  /**
   * Send events to Google Analytics
   */
  private async sendToGoogleAnalytics(events: AnalyticsEvent[]): Promise<void> {
    // This would be implemented with Google Analytics 4 API
    // For now, just a placeholder
    if (!this.config.destinations.googleAnalytics?.measurementId) {
      return;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      events.forEach(event => {
        (window as any).gtag('event', event.eventType, {
          ...event.properties,
          user_id: event.userId,
          session_id: event.sessionId,
        });
      });
    }
  }

  /**
   * Send events to Mixpanel
   */
  private async sendToMixpanel(events: AnalyticsEvent[]): Promise<void> {
    // This would be implemented with Mixpanel API
    // For now, just a placeholder
    if (!this.config.destinations.mixpanel?.projectToken) {
      return;
    }

    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      events.forEach(event => {
        (window as any).mixpanel.track(event.eventType, {
          ...event.properties,
          distinct_id: event.userId || event.anonymousId,
          time: event.timestamp,
        });
      });
    }
  }

  /**
   * Send events to Amplitude
   */
  private async sendToAmplitude(events: AnalyticsEvent[]): Promise<void> {
    // This would be implemented with Amplitude API
    // For now, just a placeholder
    if (!this.config.destinations.amplitude?.apiKey) {
      return;
    }

    if (typeof window !== 'undefined' && (window as any).amplitude) {
      events.forEach(event => {
        (window as any).amplitude.getInstance().logEvent(event.eventType, {
          ...event.properties,
          user_id: event.userId,
          device_id: event.anonymousId,
        });
      });
    }
  }

  /**
   * Start batch processing interval
   */
  private startBatchProcessing(): void {
    // Clear any existing interval
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
    }

    // Set up new interval
    this.batchInterval = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.processQueue();
      }
    }, this.config.batchInterval);
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      // Create observer for web vitals
      this.performanceObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // Track different performance metrics
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                this.trackPerformance(
                  PerformanceMetricType.FIRST_CONTENTFUL_PAINT,
                  entry.startTime
                );
              }
              break;
            case 'largest-contentful-paint':
              this.trackPerformance(
                PerformanceMetricType.LARGEST_CONTENTFUL_PAINT,
                entry.startTime
              );
              break;
            case 'first-input':
              this.trackPerformance(
                PerformanceMetricType.FIRST_INPUT_DELAY,
                (entry as any).processingStart - entry.startTime
              );
              break;
            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                this.trackPerformance(
                  PerformanceMetricType.CUMULATIVE_LAYOUT_SHIFT,
                  (entry as any).value
                );
              }
              break;
            case 'resource':
              // Track resource loading performance
              const resourceEntry = entry as PerformanceResourceTiming;
              if (resourceEntry.name.includes('audio') || resourceEntry.name.includes('mp3')) {
                this.trackPerformance(PerformanceMetricType.AUDIO_LOAD_TIME, resourceEntry.duration, {
                  url: resourceEntry.name,
                  size: resourceEntry.transferSize,
                });
              }
              break;
          }
        }
      });

      // Observe different performance entry types
      try {
        this.performanceObserver.observe({ type: 'paint', buffered: true });
        this.performanceObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        this.performanceObserver.observe({ type: 'first-input', buffered: true });
        this.performanceObserver.observe({ type: 'layout-shift', buffered: true });
        this.performanceObserver.observe({ type: 'resource', buffered: true });
      } catch (e) {
        console.warn('Performance observer setup failed:', e);
      }

      // Track page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          if (performance && performance.timing) {
            const pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.trackPerformance(PerformanceMetricType.PAGE_LOAD, pageLoadTime);
          }
        }, 0);
      });
    }
  }

  /**
   * Set up page view tracking
   */
  private setupPageViewTracking(): void {
    // Track initial page load
    this.trackPageView(window.location.href);

    // Set up history change listener for SPA navigation
    if (typeof window !== 'undefined') {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function(...args) {
        originalPushState.apply(this, args);
        AnalyticsManager.getInstance().trackPageView(window.location.href);
      };

      history.replaceState = function(...args) {
        originalReplaceState.apply(this, args);
        AnalyticsManager.getInstance().trackPageView(window.location.href);
      };

      window.addEventListener('popstate', () => {
        AnalyticsManager.getInstance().trackPageView(window.location.href);
      });
    }
  }

  /**
   * Set up click tracking
   */
  private setupClickTracking(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', (event) => {
        // Find closest element with data-analytics attribute
        let target = event.target as HTMLElement;
        let analyticsData = null;

        while (target && !analyticsData) {
          analyticsData = target.getAttribute('data-analytics');
          if (!analyticsData && target.parentElement) {
            target = target.parentElement;
          } else {
            break;
          }
        }

        if (analyticsData) {
          try {
            const data = JSON.parse(analyticsData);
            this.track(data.eventType || 'element_clicked', {
              element: target.tagName,
              elementId: target.id,
              elementClass: target.className,
              elementText: target.textContent?.trim(),
              ...data,
            });
          } catch (e) {
            console.warn('Failed to parse analytics data:', e);
          }
        }
      });
    }
  }

  /**
   * Generate a new session ID
   */
  private generateSessionId(): string {
    return uuidv4();
  }

  /**
   * Get or create anonymous ID
   */
  private getOrCreateAnonymousId(): string {
    if (this.config.persistentStorage && typeof localStorage !== 'undefined') {
      try {
        const storedId = localStorage.getItem('gigavibe_anonymous_id');
        if (storedId) {
          return storedId;
        }
      } catch (e) {
        console.warn('Failed to retrieve anonymous ID from storage:', e);
      }
    }

    const newId = uuidv4();

    if (this.config.persistentStorage && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('gigavibe_anonymous_id', newId);
      } catch (e) {
        console.warn('Failed to store anonymous ID:', e);
      }
    }

    return newId;
  }

  /**
   * Load stored consent preferences
   */
  private loadStoredConsent(): void {
    if (this.config.persistentStorage && typeof localStorage !== 'undefined') {
      try {
        const storedConsent = localStorage.getItem('gigavibe_consent');
        if (storedConsent) {
          this.consentCategories = new Set(JSON.parse(storedConsent));
        }
      } catch (e) {
        console.warn('Failed to load stored consent preferences:', e);
      }
    }
  }

  /**
   * Anonymize a wallet address
   */
  private anonymizeWalletAddress(address: string): string {
    if (!address) return '';
    // Keep first 6 and last 4 characters
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  /**
   * Update specific metrics based on event type
   */
  private updateMetricsForEvent(eventType: AnalyticsEventType, properties: AnalyticsEventProperties): void {
    switch (eventType) {
      case AnalyticsEventType.RECORDING_STARTED:
        this.recordingCompletionData.started++;
        break;
      
      case AnalyticsEventType.RECORDING_COMPLETED:
        this.recordingCompletionData.completed++;
        break;
      
      case AnalyticsEventType.RECORDING_ABANDONED:
        this.recordingCompletionData.abandoned++;
        break;
      
      case AnalyticsEventType.FIRST_VOTE_CAST:
        if (properties.timeToFirstVote) {
          this.timeToFirstVote.push(properties.timeToFirstVote);
        }
        break;
    }
  }

  /**
   * Sanitize config for logging (remove sensitive data)
   */
  private sanitizeConfigForLogging(config: AnalyticsConfig): any {
    const sanitized = { ...config };
    
    // Remove API keys
    if (sanitized.apiKey) sanitized.apiKey = '***';
    if (sanitized.destinations.googleAnalytics?.measurementId) {
      sanitized.destinations.googleAnalytics.measurementId = '***';
    }
    if (sanitized.destinations.mixpanel?.projectToken) {
      sanitized.destinations.mixpanel.projectToken = '***';
    }
    if (sanitized.destinations.amplitude?.apiKey) {
      sanitized.destinations.amplitude.apiKey = '***';
    }
    
    // Remove custom handler function
    if (sanitized.destinations.custom?.handler) {
      delete sanitized.destinations.custom.handler;
    }
    
    return sanitized;
  }
}

// Export singleton instance
export const analyticsManager = AnalyticsManager.getInstance();

// Export default for testing
export default AnalyticsManager;
