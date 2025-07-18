import { EventEmitter } from 'events';
import { analyticsManager, AnalyticsEventType } from '../analytics/AnalyticsManager';
import { audioManager } from '../audio/AudioServiceManager';

/**
 * Content moderation status
 */
export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
  UNDER_REVIEW = 'under_review',
  AUTO_APPROVED = 'auto_approved'
}

/**
 * Content moderation reason
 */
export enum ModerationReason {
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  COPYRIGHT_VIOLATION = 'copyright_violation',
  HATE_SPEECH = 'hate_speech',
  HARASSMENT = 'harassment',
  SPAM = 'spam',
  IMPERSONATION = 'impersonation',
  OFFENSIVE_LANGUAGE = 'offensive_language',
  SEXUAL_CONTENT = 'sexual_content',
  VIOLENCE = 'violence',
  MISINFORMATION = 'misinformation',
  OTHER = 'other'
}

/**
 * User reputation level
 */
export enum ReputationLevel {
  NEW = 'new',
  BASIC = 'basic',
  TRUSTED = 'trusted',
  VERIFIED = 'verified',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

/**
 * Moderation action type
 */
export enum ModerationActionType {
  WARNING = 'warning',
  CONTENT_REMOVAL = 'content_removal',
  TEMPORARY_BAN = 'temporary_ban',
  PERMANENT_BAN = 'permanent_ban',
  SHADOW_BAN = 'shadow_ban',
  RESTRICT_FEATURES = 'restrict_features',
  REQUIRE_VERIFICATION = 'require_verification',
  MANUAL_REVIEW = 'manual_review'
}

/**
 * Report type
 */
export enum ReportType {
  PERFORMANCE = 'performance',
  COMMENT = 'comment',
  USER = 'user',
  CHALLENGE = 'challenge'
}

/**
 * Content type
 */
export enum ContentType {
  AUDIO = 'audio',
  TEXT = 'text',
  IMAGE = 'image',
  USER_PROFILE = 'user_profile',
  CHALLENGE = 'challenge'
}

/**
 * Moderation filter strength
 */
export enum FilterStrength {
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  STRICT = 'strict',
  MAXIMUM = 'maximum'
}

/**
 * Report status
 */
export enum ReportStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

/**
 * Content report interface
 */
export interface ContentReport {
  id: string;
  contentId: string;
  contentType: ContentType;
  reporterId: string;
  reporterReputationLevel: ReputationLevel;
  reason: ModerationReason;
  details?: string;
  status: ReportStatus;
  timestamp: number;
  reviewerId?: string;
  reviewTimestamp?: number;
  actionTaken?: ModerationActionType;
}

/**
 * Moderation result interface
 */
export interface ModerationResult {
  status: ModerationStatus;
  contentId: string;
  contentType: ContentType;
  timestamp: number;
  reason?: ModerationReason;
  confidence?: number;
  reviewRequired?: boolean;
  moderatorId?: string;
  actionTaken?: ModerationActionType;
  metadata?: Record<string, any>;
}

/**
 * User reputation interface
 */
export interface UserReputation {
  userId: string;
  reputationLevel: ReputationLevel;
  reputationScore: number;
  contentSubmitted: number;
  contentApproved: number;
  contentRejected: number;
  reportsSubmitted: number;
  reportsValidated: number;
  lastUpdated: number;
  verificationStatus?: {
    verified: boolean;
    method?: string;
    timestamp?: number;
  };
  strikes: {
    count: number;
    history: Array<{
      reason: ModerationReason;
      timestamp: number;
      expiresAt?: number;
    }>;
  };
}

/**
 * Audio moderation result interface
 */
export interface AudioModerationResult {
  contentId: string;
  duration: number;
  hasInappropriateContent: boolean;
  confidence: number;
  detectedIssues: Array<{
    type: ModerationReason;
    confidence: number;
    timestamp?: number;
    duration?: number;
  }>;
  transcriptIssues?: Array<{
    text: string;
    type: ModerationReason;
    confidence: number;
    startTime: number;
    endTime: number;
  }>;
}

/**
 * Text moderation result interface
 */
export interface TextModerationResult {
  contentId: string;
  text: string;
  hasInappropriateContent: boolean;
  confidence: number;
  detectedIssues: Array<{
    type: ModerationReason;
    confidence: number;
    textSegment?: string;
  }>;
}

/**
 * Moderation configuration interface
 */
export interface ModerationConfig {
  enabled: boolean;
  autoModeration: {
    enabled: boolean;
    filterStrength: FilterStrength;
    confidenceThreshold: number;
    audioAnalysis: boolean;
    textAnalysis: boolean;
    imageAnalysis: boolean;
    autoApproveVerifiedUsers: boolean;
    requireApprovalForNewUsers: boolean;
  };
  communityModeration: {
    enabled: boolean;
    minReportsForReview: number;
    trustedUserReportWeight: number;
    newUserReportWeight: number;
  };
  reputationSystem: {
    enabled: boolean;
    initialScore: number;
    scoreThresholds: Record<ReputationLevel, number>;
    pointsForApprovedContent: number;
    pointsForRejectedContent: number;
    pointsForValidReport: number;
    pointsForInvalidReport: number;
    decayEnabled: boolean;
    decayRate: number; // Points per day
  };
  humanModeration: {
    enabled: boolean;
    reviewQueueSize: number;
    reviewTimeoutHours: number;
    escalationThreshold: number;
  };
  aiModeration: {
    enabled: boolean;
    provider: 'openai' | 'anthropic' | 'google' | 'custom';
    apiKey?: string;
    endpoint?: string;
    modelName?: string;
    batchSize: number;
    maxRetries: number;
  };
  appealProcess: {
    enabled: boolean;
    cooldownPeriod: number; // Hours
    maxAppealsPerUser: number;
    requireEvidence: boolean;
  };
  safetyFeatures: {
    shadowBanning: boolean;
    contentWarnings: boolean;
    ageRestriction: boolean;
    userBlocking: boolean;
    ipBlocking: boolean;
    wordFilters: boolean;
    restrictedWords: string[];
  };
}

/**
 * Default moderation configuration
 */
const DEFAULT_CONFIG: ModerationConfig = {
  enabled: true,
  autoModeration: {
    enabled: true,
    filterStrength: FilterStrength.MODERATE,
    confidenceThreshold: 0.8,
    audioAnalysis: true,
    textAnalysis: true,
    imageAnalysis: false, // Requires additional setup
    autoApproveVerifiedUsers: true,
    requireApprovalForNewUsers: true
  },
  communityModeration: {
    enabled: true,
    minReportsForReview: 3,
    trustedUserReportWeight: 2.0,
    newUserReportWeight: 0.5
  },
  reputationSystem: {
    enabled: true,
    initialScore: 50,
    scoreThresholds: {
      [ReputationLevel.NEW]: 0,
      [ReputationLevel.BASIC]: 50,
      [ReputationLevel.TRUSTED]: 200,
      [ReputationLevel.VERIFIED]: 500,
      [ReputationLevel.MODERATOR]: 1000,
      [ReputationLevel.ADMIN]: 5000
    },
    pointsForApprovedContent: 10,
    pointsForRejectedContent: -20,
    pointsForValidReport: 5,
    pointsForInvalidReport: -2,
    decayEnabled: true,
    decayRate: 0.5 // Points per day
  },
  humanModeration: {
    enabled: true,
    reviewQueueSize: 100,
    reviewTimeoutHours: 48,
    escalationThreshold: 0.7
  },
  aiModeration: {
    enabled: true,
    provider: 'openai',
    modelName: 'gpt-4',
    batchSize: 10,
    maxRetries: 3
  },
  appealProcess: {
    enabled: true,
    cooldownPeriod: 24,
    maxAppealsPerUser: 3,
    requireEvidence: true
  },
  safetyFeatures: {
    shadowBanning: true,
    contentWarnings: true,
    ageRestriction: true,
    userBlocking: true,
    ipBlocking: true,
    wordFilters: true,
    restrictedWords: [
      // Common offensive words would be listed here
      // This is a placeholder for actual implementation
    ]
  }
};

/**
 * Moderation events
 */
export enum ModerationEvent {
  CONTENT_SUBMITTED = 'content:submitted',
  CONTENT_APPROVED = 'content:approved',
  CONTENT_REJECTED = 'content:rejected',
  CONTENT_FLAGGED = 'content:flagged',
  REPORT_SUBMITTED = 'report:submitted',
  REPORT_RESOLVED = 'report:resolved',
  USER_WARNED = 'user:warned',
  USER_BANNED = 'user:banned',
  USER_REPUTATION_UPDATED = 'user:reputation:updated',
  MODERATION_ERROR = 'moderation:error',
  APPEAL_SUBMITTED = 'appeal:submitted',
  APPEAL_RESOLVED = 'appeal:resolved'
}

/**
 * ModerationService - Comprehensive content moderation system
 * 
 * This service provides a complete solution for content moderation including
 * automated filtering, community reporting, user reputation management,
 * and human moderation workflows.
 */
class ModerationService extends EventEmitter {
  private static instance: ModerationService;
  private config: ModerationConfig;
  private moderationQueue: Map<string, ModerationResult> = new Map();
  private reportQueue: Map<string, ContentReport> = new Map();
  private userReputations: Map<string, UserReputation> = new Map();
  private reviewers: Set<string> = new Set();
  private reviewAssignments: Map<string, string[]> = new Map(); // reviewerId -> contentIds
  private contentOwners: Map<string, string> = new Map(); // contentId -> userId
  private blockedUsers: Set<string> = new Set();
  private shadowBannedUsers: Set<string> = new Set();
  private blockedIps: Set<string> = new Set();
  private wordFilterRegex: RegExp | null = null;
  private isInitialized: boolean = false;
  private aiModerationBatch: Array<{
    contentId: string;
    contentType: ContentType;
    content: string | ArrayBuffer;
  }> = [];
  private batchProcessingTimeout: NodeJS.Timeout | null = null;
  private appealQueue: Map<string, {
    userId: string;
    contentId: string;
    reason: string;
    evidence?: string;
    timestamp: number;
    status: 'pending' | 'approved' | 'rejected';
  }> = new Map();

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    super();
    this.config = DEFAULT_CONFIG;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ModerationService {
    if (!ModerationService.instance) {
      ModerationService.instance = new ModerationService();
    }
    return ModerationService.instance;
  }

  /**
   * Initialize the moderation service
   */
  public async init(config?: Partial<ModerationConfig>): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Merge provided config with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      autoModeration: {
        ...DEFAULT_CONFIG.autoModeration,
        ...config?.autoModeration
      },
      communityModeration: {
        ...DEFAULT_CONFIG.communityModeration,
        ...config?.communityModeration
      },
      reputationSystem: {
        ...DEFAULT_CONFIG.reputationSystem,
        ...config?.reputationSystem
      },
      humanModeration: {
        ...DEFAULT_CONFIG.humanModeration,
        ...config?.humanModeration
      },
      aiModeration: {
        ...DEFAULT_CONFIG.aiModeration,
        ...config?.aiModeration
      },
      appealProcess: {
        ...DEFAULT_CONFIG.appealProcess,
        ...config?.appealProcess
      },
      safetyFeatures: {
        ...DEFAULT_CONFIG.safetyFeatures,
        ...config?.safetyFeatures
      }
    };

    // Set up word filters if enabled
    if (this.config.safetyFeatures.wordFilters && 
        this.config.safetyFeatures.restrictedWords.length > 0) {
      this.compileWordFilter();
    }

    // Load stored data (in a real implementation, this would load from a database)
    await this.loadStoredData();

    // Mark as initialized
    this.isInitialized = true;

    // Track initialization
    analyticsManager.track(AnalyticsEventType.APP_LOADED, {
      component: 'ModerationService',
      config: {
        filterStrength: this.config.autoModeration.filterStrength,
        aiEnabled: this.config.aiModeration.enabled,
        communityEnabled: this.config.communityModeration.enabled
      }
    });
  }

  /**
   * Submit content for moderation
   */
  public async moderateContent(
    contentId: string,
    contentType: ContentType,
    content: string | ArrayBuffer | Blob,
    userId: string
  ): Promise<ModerationResult> {
    if (!this.isInitialized || !this.config.enabled) {
      // Auto-approve if moderation is disabled
      return this.createModerationResult(contentId, contentType, ModerationStatus.APPROVED);
    }

    // Store content owner mapping
    this.contentOwners.set(contentId, userId);

    // Get user reputation
    const userReputation = await this.getUserReputation(userId);

    // Check if user is blocked or shadow banned
    if (this.blockedUsers.has(userId)) {
      return this.createModerationResult(
        contentId, 
        contentType, 
        ModerationStatus.REJECTED, 
        ModerationReason.OTHER
      );
    }

    // Auto-approve for trusted users if configured
    if (this.config.autoModeration.autoApproveVerifiedUsers && 
        (userReputation.reputationLevel === ReputationLevel.VERIFIED ||
         userReputation.reputationLevel === ReputationLevel.MODERATOR ||
         userReputation.reputationLevel === ReputationLevel.ADMIN)) {
      
      const result = this.createModerationResult(contentId, contentType, ModerationStatus.AUTO_APPROVED);
      
      // Still queue for background checking
      this.queueForBackgroundCheck(contentId, contentType, content);
      
      return result;
    }

    // Require approval for new users if configured
    if (this.config.autoModeration.requireApprovalForNewUsers && 
        userReputation.reputationLevel === ReputationLevel.NEW) {
      
      const result = this.createModerationResult(contentId, contentType, ModerationStatus.PENDING);
      this.moderationQueue.set(contentId, result);
      
      // Queue for AI moderation
      this.queueForAIModeration(contentId, contentType, content);
      
      return result;
    }

    // Perform immediate checks based on content type
    let immediateResult: ModerationResult | null = null;

    switch (contentType) {
      case ContentType.TEXT:
        immediateResult = await this.moderateText(contentId, content as string);
        break;
      case ContentType.AUDIO:
        // Queue audio for async processing, return pending status
        this.queueForAudioModeration(contentId, content);
        immediateResult = this.createModerationResult(contentId, contentType, ModerationStatus.PENDING);
        break;
      case ContentType.IMAGE:
        // Queue image for async processing, return pending status
        if (this.config.autoModeration.imageAnalysis) {
          this.queueForImageModeration(contentId, content);
        }
        immediateResult = this.createModerationResult(contentId, contentType, ModerationStatus.PENDING);
        break;
      case ContentType.USER_PROFILE:
        // For user profiles, check text content immediately
        if (typeof content === 'string') {
          immediateResult = await this.moderateText(contentId, content);
        } else {
          immediateResult = this.createModerationResult(contentId, contentType, ModerationStatus.PENDING);
        }
        break;
      case ContentType.CHALLENGE:
        // For challenges, check text content immediately
        if (typeof content === 'string') {
          immediateResult = await this.moderateText(contentId, content);
        } else {
          immediateResult = this.createModerationResult(contentId, contentType, ModerationStatus.PENDING);
        }
        break;
    }

    // If immediate check failed, return result
    if (immediateResult && immediateResult.status === ModerationStatus.REJECTED) {
      // Update user reputation
      await this.updateUserReputationForRejection(userId, immediateResult.reason || ModerationReason.OTHER);
      return immediateResult;
    }

    // Queue for AI moderation if enabled
    if (this.config.aiModeration.enabled) {
      this.queueForAIModeration(contentId, contentType, content);
    }

    // If we need human review, queue it
    const needsHumanReview = 
      (contentType === ContentType.AUDIO && this.config.humanModeration.enabled) ||
      (userReputation.reputationLevel === ReputationLevel.NEW && this.config.autoModeration.requireApprovalForNewUsers);

    if (needsHumanReview) {
      const result = immediateResult || this.createModerationResult(contentId, contentType, ModerationStatus.PENDING);
      this.moderationQueue.set(contentId, result);
      
      // Assign to human moderator if available
      this.assignToModerator(contentId);
      
      return result;
    }

    // If we got here, auto-approve the content
    return immediateResult || this.createModerationResult(contentId, contentType, ModerationStatus.APPROVED);
  }

  /**
   * Submit a report for content
   */
  public async reportContent(
    contentId: string,
    contentType: ContentType,
    reporterId: string,
    reason: ModerationReason,
    details?: string
  ): Promise<string> {
    if (!this.isInitialized || !this.config.enabled || !this.config.communityModeration.enabled) {
      return 'report_disabled';
    }

    // Get reporter's reputation
    const reporterReputation = await this.getUserReputation(reporterId);

    // Generate report ID
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create report object
    const report: ContentReport = {
      id: reportId,
      contentId,
      contentType,
      reporterId,
      reporterReputationLevel: reporterReputation.reputationLevel,
      reason,
      details,
      status: ReportStatus.SUBMITTED,
      timestamp: Date.now()
    };

    // Add to report queue
    this.reportQueue.set(reportId, report);

    // Track report submission
    analyticsManager.track(AnalyticsEventType.PERFORMANCE_SUBMITTED, {
      reportId,
      contentId,
      contentType,
      reason
    });

    // Emit event
    this.emit(ModerationEvent.REPORT_SUBMITTED, report);

    // Check if content has received enough reports to trigger review
    this.checkReportThreshold(contentId);

    return reportId;
  }

  /**
   * Check if content has reached the report threshold
   */
  private checkReportThreshold(contentId: string): void {
    // Count reports for this content
    let reportCount = 0;
    let weightedCount = 0;

    for (const report of this.reportQueue.values()) {
      if (report.contentId === contentId && report.status === ReportStatus.SUBMITTED) {
        reportCount++;

        // Apply weight based on reporter's reputation
        let weight = 1.0;
        switch (report.reporterReputationLevel) {
          case ReputationLevel.NEW:
            weight = this.config.communityModeration.newUserReportWeight;
            break;
          case ReputationLevel.TRUSTED:
          case ReputationLevel.VERIFIED:
          case ReputationLevel.MODERATOR:
          case ReputationLevel.ADMIN:
            weight = this.config.communityModeration.trustedUserReportWeight;
            break;
        }

        weightedCount += weight;
      }
    }

    // If threshold reached, flag content for review
    if (weightedCount >= this.config.communityModeration.minReportsForReview) {
      const result = this.moderationQueue.get(contentId) || 
        this.createModerationResult(contentId, ContentType.AUDIO, ModerationStatus.FLAGGED); // Default to AUDIO if unknown
      
      result.status = ModerationStatus.FLAGGED;
      this.moderationQueue.set(contentId, result);
      
      // Assign to human moderator
      this.assignToModerator(contentId);
      
      // Emit event
      this.emit(ModerationEvent.CONTENT_FLAGGED, result);
    }
  }

  /**
   * Assign content to a human moderator
   */
  private assignToModerator(contentId: string): void {
    if (!this.config.humanModeration.enabled || this.reviewers.size === 0) {
      return;
    }

    // Find moderator with fewest assignments
    let selectedModerator: string | null = null;
    let lowestAssignmentCount = Infinity;

    for (const reviewerId of this.reviewers) {
      const assignments = this.reviewAssignments.get(reviewerId) || [];
      if (assignments.length < lowestAssignmentCount) {
        selectedModerator = reviewerId;
        lowestAssignmentCount = assignments.length;
      }
    }

    if (selectedModerator) {
      // Add to moderator's assignments
      const assignments = this.reviewAssignments.get(selectedModerator) || [];
      assignments.push(contentId);
      this.reviewAssignments.set(selectedModerator, assignments);
      
      // Update moderation result
      const result = this.moderationQueue.get(contentId);
      if (result) {
        result.status = ModerationStatus.UNDER_REVIEW;
        result.moderatorId = selectedModerator;
        this.moderationQueue.set(contentId, result);
      }
    }
  }

  /**
   * Register as a content reviewer
   */
  public registerReviewer(userId: string): boolean {
    // In a real implementation, this would check if user has moderator privileges
    this.reviewers.add(userId);
    if (!this.reviewAssignments.has(userId)) {
      this.reviewAssignments.set(userId, []);
    }
    return true;
  }

  /**
   * Unregister as a content reviewer
   */
  public unregisterReviewer(userId: string): boolean {
    // Reassign any pending reviews
    const assignments = this.reviewAssignments.get(userId) || [];
    for (const contentId of assignments) {
      this.assignToModerator(contentId);
    }
    
    this.reviewers.delete(userId);
    this.reviewAssignments.delete(userId);
    return true;
  }

  /**
   * Get content awaiting review for a moderator
   */
  public getReviewQueue(reviewerId: string): ModerationResult[] {
    const assignments = this.reviewAssignments.get(reviewerId) || [];
    return assignments
      .map(contentId => this.moderationQueue.get(contentId))
      .filter(result => result !== undefined) as ModerationResult[];
  }

  /**
   * Submit a moderation decision
   */
  public async submitModerationDecision(
    contentId: string,
    reviewerId: string,
    approved: boolean,
    reason?: ModerationReason,
    actionTaken?: ModerationActionType
  ): Promise<boolean> {
    // Check if reviewer is assigned to this content
    const assignments = this.reviewAssignments.get(reviewerId) || [];
    if (!assignments.includes(contentId)) {
      return false;
    }

    // Get the moderation result
    const result = this.moderationQueue.get(contentId);
    if (!result) {
      return false;
    }

    // Update the result
    result.status = approved ? ModerationStatus.APPROVED : ModerationStatus.REJECTED;
    result.reason = reason;
    result.actionTaken = actionTaken;
    result.moderatorId = reviewerId;
    result.timestamp = Date.now();

    // Remove from queue
    this.moderationQueue.delete(contentId);

    // Remove from reviewer's assignments
    this.reviewAssignments.set(
      reviewerId,
      assignments.filter(id => id !== contentId)
    );

    // Get content owner
    const ownerId = this.contentOwners.get(contentId);
    if (ownerId) {
      // Update user reputation
      if (approved) {
        await this.updateUserReputationForApproval(ownerId);
      } else {
        await this.updateUserReputationForRejection(ownerId, reason || ModerationReason.OTHER);
        
        // Apply action if specified
        if (actionTaken) {
          await this.applyModerationAction(ownerId, actionTaken, reason);
        }
      }
    }

    // Update reports related to this content
    for (const report of this.reportQueue.values()) {
      if (report.contentId === contentId && report.status === ReportStatus.SUBMITTED) {
        report.status = ReportStatus.RESOLVED;
        report.reviewerId = reviewerId;
        report.reviewTimestamp = Date.now();
        report.actionTaken = actionTaken;
        
        // Update reporter reputation
        if (report.reporterId) {
          if (!approved) {
            // Report was valid
            await this.updateUserReputationForValidReport(report.reporterId);
          } else {
            // Report was invalid
            await this.updateUserReputationForInvalidReport(report.reporterId);
          }
        }
        
        // Emit event
        this.emit(ModerationEvent.REPORT_RESOLVED, report);
      }
    }

    // Emit event
    if (approved) {
      this.emit(ModerationEvent.CONTENT_APPROVED, result);
    } else {
      this.emit(ModerationEvent.CONTENT_REJECTED, result);
    }

    // Track decision
    analyticsManager.track(
      approved ? AnalyticsEventType.PERFORMANCE_RATED : AnalyticsEventType.ERROR_OCCURRED,
      {
        contentId,
        reviewerId,
        approved,
        reason,
        actionTaken
      }
    );

    return true;
  }

  /**
   * Apply a moderation action to a user
   */
  private async applyModerationAction(
    userId: string,
    action: ModerationActionType,
    reason?: ModerationReason
  ): Promise<void> {
    switch (action) {
      case ModerationActionType.WARNING:
        // Send warning to user
        this.emit(ModerationEvent.USER_WARNED, { userId, reason });
        break;
        
      case ModerationActionType.CONTENT_REMOVAL:
        // Content already removed by rejection
        break;
        
      case ModerationActionType.TEMPORARY_BAN:
        // Add to blocked users temporarily
        this.blockedUsers.add(userId);
        
        // Set timeout to unblock after 24 hours
        setTimeout(() => {
          this.blockedUsers.delete(userId);
        }, 24 * 60 * 60 * 1000);
        
        this.emit(ModerationEvent.USER_BANNED, { 
          userId, 
          reason, 
          permanent: false 
        });
        break;
        
      case ModerationActionType.PERMANENT_BAN:
        // Add to blocked users permanently
        this.blockedUsers.add(userId);
        
        this.emit(ModerationEvent.USER_BANNED, { 
          userId, 
          reason, 
          permanent: true 
        });
        break;
        
      case ModerationActionType.SHADOW_BAN:
        if (this.config.safetyFeatures.shadowBanning) {
          this.shadowBannedUsers.add(userId);
        }
        break;
        
      case ModerationActionType.RESTRICT_FEATURES:
        // In a real implementation, this would update user permissions
        break;
        
      case ModerationActionType.REQUIRE_VERIFICATION:
        // In a real implementation, this would flag the account for verification
        break;
    }
  }

  /**
   * Submit an appeal for rejected content
   */
  public async submitAppeal(
    userId: string,
    contentId: string,
    reason: string,
    evidence?: string
  ): Promise<string | null> {
    if (!this.config.appealProcess.enabled) {
      return null;
    }

    // Check if user has reached appeal limit
    const userAppeals = Array.from(this.appealQueue.values())
      .filter(appeal => appeal.userId === userId)
      .length;
    
    if (userAppeals >= this.config.appealProcess.maxAppealsPerUser) {
      return null;
    }

    // Check if content was actually rejected
    const contentOwner = this.contentOwners.get(contentId);
    if (contentOwner !== userId) {
      return null;
    }

    // Generate appeal ID
    const appealId = `appeal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create appeal
    this.appealQueue.set(appealId, {
      userId,
      contentId,
      reason,
      evidence,
      timestamp: Date.now(),
      status: 'pending'
    });

    // Emit event
    this.emit(ModerationEvent.APPEAL_SUBMITTED, {
      appealId,
      userId,
      contentId,
      reason
    });

    return appealId;
  }

  /**
   * Resolve an appeal
   */
  public async resolveAppeal(
    appealId: string,
    approved: boolean,
    reviewerId: string
  ): Promise<boolean> {
    const appeal = this.appealQueue.get(appealId);
    if (!appeal) {
      return false;
    }

    // Update appeal status
    appeal.status = approved ? 'approved' : 'rejected';

    // If approved, restore content
    if (approved) {
      // Create new moderation result
      const result = this.createModerationResult(
        appeal.contentId,
        ContentType.AUDIO, // Default to AUDIO if unknown
        ModerationStatus.APPROVED
      );
      
      // Emit event
      this.emit(ModerationEvent.CONTENT_APPROVED, result);
      
      // Restore user reputation
      const ownerId = appeal.userId;
      if (ownerId) {
        await this.updateUserReputationForApproval(ownerId);
      }
    }

    // Emit event
    this.emit(ModerationEvent.APPEAL_RESOLVED, {
      appealId,
      approved,
      reviewerId
    });

    return true;
  }

  /**
   * Check if content is appropriate
   */
  public async isContentAppropriate(
    contentId: string,
    contentType: ContentType,
    content: string | ArrayBuffer | Blob
  ): Promise<boolean> {
    if (!this.isInitialized || !this.config.enabled) {
      return true;
    }

    switch (contentType) {
      case ContentType.TEXT:
        const textResult = await this.moderateText(contentId, content as string);
        return textResult.status !== ModerationStatus.REJECTED;
        
      case ContentType.AUDIO:
        // For audio, we need to do async processing
        // This is a simplified check that just returns true
        // In a real implementation, this would analyze the audio
        return true;
        
      case ContentType.IMAGE:
        // For images, we need to do async processing
        // This is a simplified check that just returns true
        // In a real implementation, this would analyze the image
        return true;
        
      default:
        return true;
    }
  }

  /**
   * Check if user is allowed to post content
   */
  public async canUserPostContent(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    if (!this.isInitialized || !this.config.enabled) {
      return { allowed: true };
    }

    // Check if user is blocked
    if (this.blockedUsers.has(userId)) {
      return { 
        allowed: false,
        reason: 'User is blocked from posting content'
      };
    }

    // Get user reputation
    const reputation = await this.getUserReputation(userId);

    // Check for too many strikes
    if (reputation.strikes.count >= 3) {
      return {
        allowed: false,
        reason: 'User has too many moderation strikes'
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user is shadow banned
   */
  public isShadowBanned(userId: string): boolean {
    return this.shadowBannedUsers.has(userId);
  }

  /**
   * Get user reputation
   */
  public async getUserReputation(userId: string): Promise<UserReputation> {
    // Check if we already have reputation data
    if (this.userReputations.has(userId)) {
      return this.userReputations.get(userId)!;
    }

    // Create new reputation record
    const newReputation: UserReputation = {
      userId,
      reputationLevel: ReputationLevel.NEW,
      reputationScore: this.config.reputationSystem.initialScore,
      contentSubmitted: 0,
      contentApproved: 0,
      contentRejected: 0,
      reportsSubmitted: 0,
      reportsValidated: 0,
      lastUpdated: Date.now(),
      strikes: {
        count: 0,
        history: []
      }
    };

    this.userReputations.set(userId, newReputation);
    return newReputation;
  }

  /**
   * Update user reputation for approved content
   */
  private async updateUserReputationForApproval(userId: string): Promise<void> {
    if (!this.config.reputationSystem.enabled) {
      return;
    }

    const reputation = await this.getUserReputation(userId);
    
    // Update stats
    reputation.contentApproved++;
    reputation.contentSubmitted++;
    reputation.reputationScore += this.config.reputationSystem.pointsForApprovedContent;
    reputation.lastUpdated = Date.now();
    
    // Update reputation level
    this.updateReputationLevel(reputation);
    
    // Emit event
    this.emit(ModerationEvent.USER_REPUTATION_UPDATED, reputation);
  }

  /**
   * Update user reputation for rejected content
   */
  private async updateUserReputationForRejection(
    userId: string,
    reason: ModerationReason
  ): Promise<void> {
    if (!this.config.reputationSystem.enabled) {
      return;
    }

    const reputation = await this.getUserReputation(userId);
    
    // Update stats
    reputation.contentRejected++;
    reputation.contentSubmitted++;
    reputation.reputationScore += this.config.reputationSystem.pointsForRejectedContent;
    reputation.lastUpdated = Date.now();
    
    // Add strike
    reputation.strikes.count++;
    reputation.strikes.history.push({
      reason,
      timestamp: Date.now()
    });
    
    // Update reputation level
    this.updateReputationLevel(reputation);
    
    // Emit event
    this.emit(ModerationEvent.USER_REPUTATION_UPDATED, reputation);
  }

  /**
   * Update user reputation for valid report
   */
  private async updateUserReputationForValidReport(userId: string): Promise<void> {
    if (!this.config.reputationSystem.enabled) {
      return;
    }

    const reputation = await this.getUserReputation(userId);
    
    // Update stats
    reputation.reportsSubmitted++;
    reputation.reportsValidated++;
    reputation.reputationScore += this.config.reputationSystem.pointsForValidReport;
    reputation.lastUpdated = Date.now();
    
    // Update reputation level
    this.updateReputationLevel(reputation);
    
    // Emit event
    this.emit(ModerationEvent.USER_REPUTATION_UPDATED, reputation);
  }

  /**
   * Update user reputation for invalid report
   */
  private async updateUserReputationForInvalidReport(userId: string): Promise<void> {
    if (!this.config.reputationSystem.enabled) {
      return;
    }

    const reputation = await this.getUserReputation(userId);
    
    // Update stats
    reputation.reportsSubmitted++;
    reputation.reputationScore += this.config.reputationSystem.pointsForInvalidReport;
    reputation.lastUpdated = Date.now();
    
    // Update reputation level
    this.updateReputationLevel(reputation);
    
    // Emit event
    this.emit(ModerationEvent.USER_REPUTATION_UPDATED, reputation);
  }

  /**
   * Update reputation level based on score
   */
  private updateReputationLevel(reputation: UserReputation): void {
    const thresholds = this.config.reputationSystem.scoreThresholds;
    
    // Find the highest level the user qualifies for
    if (reputation.reputationScore >= thresholds[ReputationLevel.ADMIN]) {
      reputation.reputationLevel = ReputationLevel.ADMIN;
    } else if (reputation.reputationScore >= thresholds[ReputationLevel.MODERATOR]) {
      reputation.reputationLevel = ReputationLevel.MODERATOR;
    } else if (reputation.reputationScore >= thresholds[ReputationLevel.VERIFIED]) {
      reputation.reputationLevel = ReputationLevel.VERIFIED;
    } else if (reputation.reputationScore >= thresholds[ReputationLevel.TRUSTED]) {
      reputation.reputationLevel = ReputationLevel.TRUSTED;
    } else if (reputation.reputationScore >= thresholds[ReputationLevel.BASIC]) {
      reputation.reputationLevel = ReputationLevel.BASIC;
    } else {
      reputation.reputationLevel = ReputationLevel.NEW;
    }
  }

  /**
   * Moderate text content
   */
  private async moderateText(contentId: string, text: string): Promise<ModerationResult> {
    // Check against word filter
    if (this.config.safetyFeatures.wordFilters && this.wordFilterRegex) {
      const matches = text.match(this.wordFilterRegex);
      if (matches && matches.length > 0) {
        return this.createModerationResult(
          contentId,
          ContentType.TEXT,
          ModerationStatus.REJECTED,
          ModerationReason.OFFENSIVE_LANGUAGE,
          0.95
        );
      }
    }

    // If AI moderation is enabled, queue for more thorough check
    if (this.config.aiModeration.enabled) {
      this.queueForAIModeration(contentId, ContentType.TEXT, text);
    }

    // For now, approve the content
    return this.createModerationResult(
      contentId,
      ContentType.TEXT,
      ModerationStatus.APPROVED
    );
  }

  /**
   * Queue content for audio moderation
   */
  private queueForAudioModeration(contentId: string, content: string | ArrayBuffer | Blob): void {
    // In a real implementation, this would send the audio to a processing service
    // For now, we'll simulate async processing with a timeout
    setTimeout(async () => {
      try {
        // Simulate audio analysis
        const result: AudioModerationResult = {
          contentId,
          duration: 60, // Simulated duration
          hasInappropriateContent: false,
          confidence: 0.95,
          detectedIssues: []
        };

        // Update moderation result
        const moderationResult = this.moderationQueue.get(contentId) || 
          this.createModerationResult(contentId, ContentType.AUDIO, ModerationStatus.PENDING);
        
        if (result.hasInappropriateContent) {
          moderationResult.status = ModerationStatus.REJECTED;
          moderationResult.reason = ModerationReason.INAPPROPRIATE_CONTENT;
          moderationResult.confidence = result.confidence;
          
          // Get content owner
          const ownerId = this.contentOwners.get(contentId);
          if (ownerId) {
            await this.updateUserReputationForRejection(
              ownerId,
              ModerationReason.INAPPROPRIATE_CONTENT
            );
          }
          
          // Emit event
          this.emit(ModerationEvent.CONTENT_REJECTED, moderationResult);
        } else {
          // Content is appropriate, approve it
          moderationResult.status = ModerationStatus.APPROVED;
          
          // Get content owner
          const ownerId = this.contentOwners.get(contentId);
          if (ownerId) {
            await this.updateUserReputationForApproval(ownerId);
          }
          
          // Emit event
          this.emit(ModerationEvent.CONTENT_APPROVED, moderationResult);
        }
        
        // Remove from queue since processing is complete
        this.moderationQueue.delete(contentId);
      } catch (error) {
        console.error('Audio moderation error:', error);
        this.emit(ModerationEvent.MODERATION_ERROR, {
          contentId,
          error
        });
      }
    }, 2000); // Simulate 2 second processing time
  }

  /**
   * Queue content for image moderation
   */
  private queueForImageModeration(contentId: string, content: string | ArrayBuffer | Blob): void {
    // In a real implementation, this would send the image to a processing service
    // For now, we'll simulate async processing with a timeout
    setTimeout(() => {
      // Simulate image analysis (always approve in this simulation)
      const moderationResult = this.moderationQueue.get(contentId) ||
        this.createModerationResult(contentId, ContentType.IMAGE, ModerationStatus.PENDING);
      
      if (moderationResult.status === ModerationStatus.PENDING) {
        moderationResult.status = ModerationStatus.APPROVED;
        
        // Emit event
        this.emit(ModerationEvent.CONTENT_APPROVED, moderationResult);
        
        // Remove from queue
        this.moderationQueue.delete(contentId);
      }
    }, 1000); // Simulate 1 second processing time
  }

  /**
   * Queue content for background checking
   */
  private queueForBackgroundCheck(
    contentId: string,
    contentType: ContentType,
    content: string | ArrayBuffer | Blob
  ): void {
    // In a real implementation, this would queue content for background checking
    // even though it's already approved for display
    
    // For now, just queue for AI moderation if enabled
    if (this.config.aiModeration.enabled) {
      this.queueForAIModeration(contentId, contentType, content);
    }
  }

  /**
   * Queue content for AI moderation
   */
  private queueForAIModeration(
    contentId: string,
    contentType: ContentType,
    content: string | ArrayBuffer | Blob
  ): void {
    if (!this.config.aiModeration.enabled) {
      return;
    }

    // Add to batch
    this.aiModerationBatch.push({
      contentId,
      contentType,
      content: typeof content === 'string' ? content : content as ArrayBuffer
    });

    // Process batch if it's full
    if (this.aiModerationBatch.length >= this.config.aiModeration.batchSize) {
      this.processAIModerationBatch();
    } else if (!this.batchProcessingTimeout) {
      // Set timeout to process batch if not already set
      this.batchProcessingTimeout = setTimeout(() => {
        this.processAIModerationBatch();
      }, 5000); // Process after 5 seconds if batch isn't filled
    }
  }

  /**
   * Process AI moderation batch
   */
  private async processAIModerationBatch(): Promise<void> {
    if (this.aiModerationBatch.length === 0) {
      return;
    }

    // Clear timeout if set
    if (this.batchProcessingTimeout) {
      clearTimeout(this.batchProcessingTimeout);
      this.batchProcessingTimeout = null;
    }

    // Get batch and clear
    const batch = [...this.aiModerationBatch];
    this.aiModerationBatch = [];

    try {
      // In a real implementation, this would call an AI moderation API
      // For now, we'll simulate AI moderation with random results
      
      for (const item of batch) {
        // Simulate AI moderation (95% chance of approval)
        const isInappropriate = Math.random() < 0.05;
        const confidence = 0.8 + (Math.random() * 0.15); // 0.8 to 0.95
        
        // Get or create moderation result
        const moderationResult = this.moderationQueue.get(item.contentId) ||
          this.createModerationResult(item.contentId, item.contentType, ModerationStatus.PENDING);
        
        if (isInappropriate && confidence > this.config.autoModeration.confidenceThreshold) {
          // Content is inappropriate with high confidence
          moderationResult.status = ModerationStatus.REJECTED;
          moderationResult.reason = ModerationReason.INAPPROPRIATE_CONTENT;
          moderationResult.confidence = confidence;
          
          // Get content owner
          const ownerId = this.contentOwners.get(item.contentId);
          if (ownerId) {
            await this.updateUserReputationForRejection(
              ownerId,
              ModerationReason.INAPPROPRIATE_CONTENT
            );
          }
          
          // Emit event
          this.emit(ModerationEvent.CONTENT_REJECTED, moderationResult);
          
          // Remove from queue
          this.moderationQueue.delete(item.contentId);
        } else if (isInappropriate) {
          // Content might be inappropriate but confidence is low
          // Flag for human review
          moderationResult.status = ModerationStatus.FLAGGED;
          moderationResult.reason = ModerationReason.INAPPROPRIATE_CONTENT;
          moderationResult.confidence = confidence;
          moderationResult.reviewRequired = true;
          
          // Update queue
          this.moderationQueue.set(item.contentId, moderationResult);
          
          // Assign to human moderator
          this.assignToModerator(item.contentId);
          
          // Emit event
          this.emit(ModerationEvent.CONTENT_FLAGGED, moderationResult);
        } else if (moderationResult.status === ModerationStatus.PENDING) {
          // Content is appropriate
          moderationResult.status = ModerationStatus.APPROVED;
          moderationResult.confidence = confidence;
          
          // Get content owner
          const ownerId = this.contentOwners.get(item.contentId);
          if (ownerId) {
            await this.updateUserReputationForApproval(ownerId);
          }
          
          // Emit event
          this.emit(ModerationEvent.CONTENT_APPROVED, moderationResult);
          
          // Remove from queue
          this.moderationQueue.delete(item.contentId);
        }
      }
    } catch (error) {
      console.error('AI moderation error:', error);
      this.emit(ModerationEvent.MODERATION_ERROR, {
        error
      });
      
      // Requeue items for retry
      for (const item of batch) {
        this.aiModerationBatch.push(item);
      }
    }
  }

  /**
   * Create a moderation result object
   */
  private createModerationResult(
    contentId: string,
    contentType: ContentType,
    status: ModerationStatus,
    reason?: ModerationReason,
    confidence?: number
  ): ModerationResult {
    return {
      contentId,
      contentType,
      status,
      reason,
      confidence,
      timestamp: Date.now()
    };
  }

  /**
   * Compile word filter regex
   */
  private compileWordFilter(): void {
    if (!this.config.safetyFeatures.restrictedWords || 
        this.config.safetyFeatures.restrictedWords.length === 0) {
      return;
    }

    // Escape special regex characters and create pattern
    const pattern = this.config.safetyFeatures.restrictedWords
      .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    
    this.wordFilterRegex = new RegExp(`\\b(${pattern})\\b`, 'i');
  }

  /**
   * Load stored moderation data
   */
  private async loadStoredData(): Promise<void> {
    // In a real implementation, this would load data from a database
    // For now, we'll just initialize empty collections
    
    this.moderationQueue = new Map();
    this.reportQueue = new Map();
    this.userReputations = new Map();
    this.reviewers = new Set();
    this.reviewAssignments = new Map();
    this.contentOwners = new Map();
    this.blockedUsers = new Set();
    this.shadowBannedUsers = new Set();
    this.blockedIps = new Set();
  }

  /**
   * Get moderation status for content
   */
  public getModerationStatus(contentId: string): ModerationStatus {
    const result = this.moderationQueue.get(contentId);
    return result ? result.status : ModerationStatus.APPROVED;
  }

  /**
   * Check if content is approved
   */
  public isContentApproved(contentId: string): boolean {
    const status = this.getModerationStatus(contentId);
    return status === ModerationStatus.APPROVED || status === ModerationStatus.AUTO_APPROVED;
  }

  /**
   * Get reports for content
   */
  public getReportsForContent(contentId: string): ContentReport[] {
    return Array.from(this.reportQueue.values())
      .filter(report => report.contentId === contentId);
  }

  /**
   * Block an IP address
   */
  public blockIpAddress(ip: string): void {
    if (this.config.safetyFeatures.ipBlocking) {
      this.blockedIps.add(ip);
    }
  }

  /**
   * Check if IP is blocked
   */
  public isIpBlocked(ip: string): boolean {
    return this.blockedIps.has(ip);
  }

  /**
   * Get moderation statistics
   */
  public getModerationStats(): {
    pendingModeration: number;
    approvedContent: number;
    rejectedContent: number;
    flaggedContent: number;
    pendingReports: number;
    resolvedReports: number;
    blockedUsers: number;
    shadowBannedUsers: number;
  } {
    // Count moderation results by status
    let pendingModeration = 0;
    let approvedContent = 0;
    let rejectedContent = 0;
    let flaggedContent = 0;
    
    for (const result of this.moderationQueue.values()) {
      switch (result.status) {
        case ModerationStatus.PENDING:
          pendingModeration++;
          break;
        case ModerationStatus.APPROVED:
        case ModerationStatus.AUTO_APPROVED:
          approvedContent++;
          break;
        case ModerationStatus.REJECTED:
          rejectedContent++;
          break;
        case ModerationStatus.FLAGGED:
        case ModerationStatus.UNDER_REVIEW:
          flaggedContent++;
          break;
      }
    }
    
    // Count reports by status
    let pendingReports = 0;
    let resolvedReports = 0;
    
    for (const report of this.reportQueue.values()) {
      if (report.status === ReportStatus.SUBMITTED || report.status === ReportStatus.UNDER_REVIEW) {
        pendingReports++;
      } else {
        resolvedReports++;
      }
    }
    
    return {
      pendingModeration,
      approvedContent,
      rejectedContent,
      flaggedContent,
      pendingReports,
      resolvedReports,
      blockedUsers: this.blockedUsers.size,
      shadowBannedUsers: this.shadowBannedUsers.size
    };
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    // Clear batch processing timeout
    if (this.batchProcessingTimeout) {
      clearTimeout(this.batchProcessingTimeout);
      this.batchProcessingTimeout = null;
    }
    
    // Clear AI moderation batch
    this.aiModerationBatch = [];
    
    // Remove all listeners
    this.removeAllListeners();
  }
}

// Export singleton instance
export const moderationService = ModerationService.getInstance();

// Export default for testing
export default ModerationService;
