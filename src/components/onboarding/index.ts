// Main onboarding components
export { default as OnboardingFlow } from './OnboardingFlow';
export { default as OnboardingLayout } from './OnboardingLayout';

// Step components
export { default as WelcomeStep } from './steps/WelcomeStep';
export { default as FeatureTourStep } from './steps/FeatureTourStep';
export { default as FirstChallengeStep } from './steps/FirstChallengeStep';
export { default as FirstVoteStep } from './steps/FirstVoteStep';
export { default as CompletedStep } from './steps/CompletedStep';

// Utility components
export { default as OnboardingTrigger } from './OnboardingTrigger';
export { default as ProgressIndicator } from './ProgressIndicator';
export { default as ContextualTip } from './ContextualTip';
export { default as FeatureUnlock } from './FeatureUnlock';

// Context and hooks
export { useOnboarding } from '@/contexts/OnboardingContext';
export { useOnboardingFlow } from '@/hooks/useOnboardingFlow';

// Types
export type { OnboardingStep } from '@/contexts/OnboardingContext';