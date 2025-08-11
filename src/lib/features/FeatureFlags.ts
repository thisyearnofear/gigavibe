/**
 * Feature Flags System
 * Manages gradual rollout of enhanced audio features
 */

export interface FeatureFlags {
  // Phase 1: Enhanced Audio Interactivity
  liveAudioCoaching: boolean;
  immersiveVisualizer: boolean;
  gestureControls: boolean;
  adaptiveBackingTracks: boolean;
  
  // Phase 2: Dynamic Social Features (upcoming)
  liveReactions: boolean;
  collaborativeChallenges: boolean;
  realTimeVoting: boolean;
  socialAudioRooms: boolean;
  
  // Phase 3: Advanced Gamification (upcoming)
  aiChallengeGeneration: boolean;
  dynamicDifficulty: boolean;
  enhancedAchievements: boolean;
  liveLeaderboards: boolean;
  
  // Phase 4: Immersive Experience (upcoming)
  performanceReactiveUI: boolean;
  spatialAudio: boolean;
  advancedGestures: boolean;
  contextualAnimations: boolean;
}

export interface DeviceCapabilities {
  hasWebAudio: boolean;
  hasWebGL: boolean;
  hasTouchPressure: boolean;
  hasVibration: boolean;
  hasWebWorkers: boolean;
  hasAudioWorklets: boolean;
  performanceLevel: 'low' | 'medium' | 'high';
}

class FeatureFlagsService {
  private flags: FeatureFlags;
  private deviceCapabilities: DeviceCapabilities;
  private userTier: 'basic' | 'premium' | 'beta' = 'basic';

  constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.flags = this.getDefaultFlags();
    this.loadUserPreferences();
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const hasWebAudio = !!(window.AudioContext || (window as any).webkitAudioContext);
    const hasWebGL = !!document.createElement('canvas').getContext('webgl');
    const hasTouchPressure = 'ontouchstart' in window && 'force' in TouchEvent.prototype;
    const hasVibration = 'vibrate' in navigator;
    const hasWebWorkers = typeof Worker !== 'undefined';
    
    let hasAudioWorklets = false;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      hasAudioWorklets = !!(audioContext.audioWorklet);
      audioContext.close();
    } catch (e) {
      hasAudioWorklets = false;
    }

    // Estimate performance level based on device capabilities
    let performanceLevel: 'low' | 'medium' | 'high' = 'medium';
    
    if (!hasWebGL || !hasWebAudio) {
      performanceLevel = 'low';
    } else if (hasAudioWorklets && hasTouchPressure && navigator.hardwareConcurrency >= 4) {
      performanceLevel = 'high';
    }

    return {
      hasWebAudio,
      hasWebGL,
      hasTouchPressure,
      hasVibration,
      hasWebWorkers,
      hasAudioWorklets,
      performanceLevel
    };
  }

  private getDefaultFlags(): FeatureFlags {
    const { performanceLevel, hasWebAudio, hasWebGL, hasAudioWorklets } = this.deviceCapabilities;

    return {
      // Phase 1: Enable based on device capabilities
      liveAudioCoaching: hasWebAudio && performanceLevel !== 'low',
      immersiveVisualizer: hasWebGL && performanceLevel !== 'low',
      gestureControls: true, // Basic gesture support for all devices
      adaptiveBackingTracks: hasAudioWorklets && performanceLevel === 'high',
      
      // Phase 2: Disabled by default (upcoming features)
      liveReactions: false,
      collaborativeChallenges: false,
      realTimeVoting: false,
      socialAudioRooms: false,
      
      // Phase 3: Disabled by default
      aiChallengeGeneration: false,
      dynamicDifficulty: false,
      enhancedAchievements: false,
      liveLeaderboards: false,
      
      // Phase 4: Disabled by default
      performanceReactiveUI: false,
      spatialAudio: false,
      advancedGestures: false,
      contextualAnimations: false
    };
  }

  private loadUserPreferences(): void {
    try {
      const stored = localStorage.getItem('gigavibe-feature-flags');
      if (stored) {
        const userFlags = JSON.parse(stored);
        this.flags = { ...this.flags, ...userFlags };
      }

      const userTier = localStorage.getItem('gigavibe-user-tier') as typeof this.userTier;
      if (userTier) {
        this.userTier = userTier;
        this.applyTierFlags();
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
  }

  private applyTierFlags(): void {
    switch (this.userTier) {
      case 'beta':
        // Beta users get early access to Phase 2 features
        this.flags.liveReactions = this.deviceCapabilities.performanceLevel !== 'low';
        this.flags.collaborativeChallenges = this.deviceCapabilities.hasWebAudio;
        this.flags.dynamicDifficulty = true;
        break;
        
      case 'premium':
        // Premium users get enhanced Phase 1 features
        this.flags.adaptiveBackingTracks = this.deviceCapabilities.hasAudioWorklets;
        this.flags.immersiveVisualizer = this.deviceCapabilities.hasWebGL;
        break;
        
      case 'basic':
      default:
        // Basic users get stable Phase 1 features only
        break;
    }
  }

  // Public API
  isEnabled(feature: keyof FeatureFlags): boolean {
    return this.flags[feature];
  }

  getFlags(): FeatureFlags {
    return { ...this.flags };
  }

  getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  enableFeature(feature: keyof FeatureFlags, enabled: boolean = true): void {
    this.flags[feature] = enabled;
    this.saveUserPreferences();
  }

  setUserTier(tier: typeof this.userTier): void {
    this.userTier = tier;
    this.applyTierFlags();
    localStorage.setItem('gigavibe-user-tier', tier);
    this.saveUserPreferences();
  }

  private saveUserPreferences(): void {
    try {
      localStorage.setItem('gigavibe-feature-flags', JSON.stringify(this.flags));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }

  // Feature-specific helpers
  getAudioFeatures() {
    return {
      liveCoaching: this.isEnabled('liveAudioCoaching'),
      adaptiveTracks: this.isEnabled('adaptiveBackingTracks'),
      immersiveVisuals: this.isEnabled('immersiveVisualizer'),
      gestureControls: this.isEnabled('gestureControls')
    };
  }

  getSocialFeatures() {
    return {
      liveReactions: this.isEnabled('liveReactions'),
      collaborative: this.isEnabled('collaborativeChallenges'),
      realTimeVoting: this.isEnabled('realTimeVoting'),
      audioRooms: this.isEnabled('socialAudioRooms')
    };
  }

  // Performance optimization helpers
  shouldUseHighQualityVisuals(): boolean {
    return this.deviceCapabilities.performanceLevel === 'high' && this.isEnabled('immersiveVisualizer');
  }

  shouldUseWebWorkers(): boolean {
    return this.deviceCapabilities.hasWebWorkers && this.deviceCapabilities.performanceLevel !== 'low';
  }

  getRecommendedParticleCount(): number {
    if (!this.isEnabled('immersiveVisualizer')) return 0;
    
    switch (this.deviceCapabilities.performanceLevel) {
      case 'high': return 200;
      case 'medium': return 100;
      case 'low': return 50;
      default: return 100;
    }
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagsService();

// React hook for easy component usage
import { useState, useEffect } from 'react';

export function useFeatureFlags() {
  const [flags, setFlags] = useState(featureFlags.getFlags());
  const [capabilities, setCapabilities] = useState(featureFlags.getDeviceCapabilities());

  useEffect(() => {
    // Listen for flag changes (if needed for real-time updates)
    const handleStorageChange = () => {
      setFlags(featureFlags.getFlags());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    flags,
    capabilities,
    isEnabled: (feature: keyof FeatureFlags) => featureFlags.isEnabled(feature),
    enableFeature: (feature: keyof FeatureFlags, enabled?: boolean) => {
      featureFlags.enableFeature(feature, enabled);
      setFlags(featureFlags.getFlags());
    },
    getAudioFeatures: () => featureFlags.getAudioFeatures(),
    getSocialFeatures: () => featureFlags.getSocialFeatures(),
    shouldUseHighQualityVisuals: () => featureFlags.shouldUseHighQualityVisuals(),
    getRecommendedParticleCount: () => featureFlags.getRecommendedParticleCount()
  };
}