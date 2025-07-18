# 🎵 AUDIO SERVICE CONSOLIDATION PLAN

## Current Audio Service Duplication:

### AudioRecordingService Duplicates:
1. **src/lib/audio/AudioRecordingService.ts** (314 lines)
   - Used by: useAudioRecording.ts, ViralChallenge.tsx
   - Features: Core recording functionality, events

2. **src/services/AudioRecordingService.ts** (369 lines) 
   - Used by: ChallengeRecording.tsx
   - Features: Enhanced recording with more features

### Audio Hooks Overlap:
- useAudioRecording.ts (uses lib version)
- useRealAudioRecording.ts (different approach)
- useAudioInput.ts (basic input)
- useEnhancedAudioAnalysis.ts (analysis)

## Consolidation Strategy:

### Phase 1: AudioRecordingService Consolidation
✅ **DECISION**: Keep src/services/AudioRecordingService.ts (369 lines, more features)
🗑️ **DELETE**: src/lib/audio/AudioRecordingService.ts (314 lines)
🔄 **UPDATE**: 2 import statements

### Phase 2: Hook Optimization  
- Merge useAudioRecording + useRealAudioRecording
- Keep useAudioInput (different purpose)
- Keep useEnhancedAudioAnalysis (specialized)

### Phase 3: AudioServiceManager Splitting
- 1,389 lines is too large
- Split into focused modules
- Maintain single entry point

## Implementation Order:
1. Fix AudioRecordingService imports ✅
2. Remove duplicate service 
3. Test functionality
4. Optimize hooks
5. Split large services