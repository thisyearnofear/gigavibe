'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Share2, 
  Star,
  Loader2,
  AlertCircle,
  User,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePerformanceUpload } from '@/hooks/usePerformanceUpload';
import { useSocialIntegration } from '@/hooks/useSocialIntegration';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { PerformanceData } from '@/types/performance.types';
import MobileAuthSheet from '@/components/auth/MobileAuthSheet';

interface PerformanceSubmissionFlowProps {
  audioBlob: Blob;
  performanceData: PerformanceData;
  onComplete: (recordingId: string) => void;
  onRetry: () => void;
  className?: string;
}

export default function PerformanceSubmissionFlow({
  audioBlob,
  performanceData,
  onComplete,
  onRetry,
  className = ''
}: PerformanceSubmissionFlowProps) {
  const { isAuthenticated, displayName, avatarUrl } = useUnifiedAuth();
  const {
    uploadState,
    uploadProgress,
    uploadResult,
    error,
    submitPerformance,
    retryUpload,
    clearError,
    reset
  } = usePerformanceUpload();
  
  const {
    isSharing,
    shareError,
    shareSuccess,
    canShare,
    shareToFarcaster,
    generateShareMessage,
    clearShareState
  } = useSocialIntegration();

  const [selfRating, setSelfRating] = useState(performanceData.selfRating || 0);
  const [showDunningKrugerHint, setShowDunningKrugerHint] = useState(false);

  // Auto-submit when component mounts if authenticated
  useEffect(() => {
    if (isAuthenticated && uploadState === 'idle') {
      const dataWithRating = { ...performanceData, selfRating };
      submitPerformance(audioBlob, dataWithRating);
    }
  }, [isAuthenticated, uploadState, audioBlob, performanceData, selfRating, submitPerformance]);

  const handleSelfRating = (rating: number) => {
    setSelfRating(rating);
    setShowDunningKrugerHint(true);
    setTimeout(() => setShowDunningKrugerHint(false), 2000);
  };

  const handleSubmitWithRating = async () => {
    if (selfRating === 0) return;
    
    const dataWithRating = { ...performanceData, selfRating };
    await submitPerformance(audioBlob, dataWithRating);
  };

  const handleShare = async () => {
    if (!uploadResult) return;
    
    const success = await shareToFarcaster(uploadResult);
    if (success) {
      // Optional: Track sharing analytics
      console.log('Performance shared successfully');
    }
  };

  const handleContinue = () => {
    if (uploadResult) {
      onComplete(uploadResult.recordingId);
    }
  };

  const getUploadStateIcon = () => {
    switch (uploadState) {
      case 'uploading':
      case 'retrying':
        return <Loader2 className="w-6 h-6 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Upload className="w-6 h-6 text-gray-500" />;
    }
  };

  const getUploadStateMessage = () => {
    switch (uploadState) {
      case 'uploading':
        return uploadProgress?.message || 'Uploading your performance...';
      case 'retrying':
        return 'Retrying upload...';
      case 'success':
        return 'Performance uploaded successfully!';
      case 'error':
        return error || 'Upload failed';
      case 'auth_required':
        return 'Please sign in to submit your performance';
      default:
        return 'Ready to upload';
    }
  };

  // Auth Required State
  if (uploadState === 'auth_required') {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <User className="w-5 h-5" />
              Sign In Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 text-center">
              Sign in to submit your performance and join the community!
            </p>
            
            <MobileAuthSheet>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <User className="w-4 h-4 mr-2" />
                Sign In to Submit
              </Button>
            </MobileAuthSheet>
            
            <Button
              onClick={onRetry}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* User Context */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName || 'User'}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <p className="text-white font-medium">{displayName}</p>
            <p className="text-gray-400 text-sm">Submitting performance...</p>
          </div>
        </motion.div>
      )}

      {/* Self-Rating Section (Dunning-Kruger) */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-center">
            How did you do?
          </CardTitle>
          <p className="text-gray-400 text-center text-sm">
            Rate your performance before the community judges it
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                onClick={() => handleSelfRating(star)}
                className={`p-2 rounded-full transition-colors ${
                  star <= selfRating
                    ? 'text-yellow-400 bg-yellow-400/20'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Star className="w-8 h-8" fill={star <= selfRating ? 'currentColor' : 'none'} />
              </motion.button>
            ))}
          </div>
          
          <AnimatePresence>
            {showDunningKrugerHint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center p-3 bg-purple-500/20 rounded-lg border border-purple-500/30"
              >
                <p className="text-purple-300 text-sm">
                  <Zap className="w-4 h-4 inline mr-1" />
                  We'll compare this to community ratings later! 
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {selfRating > 0 && !showDunningKrugerHint && (
            <div className="text-center">
              <p className="text-yellow-400 font-medium">
                {selfRating === 1 && "Room for improvement"}
                {selfRating === 2 && "Getting better"}
                {selfRating === 3 && "Pretty good"}
                {selfRating === 4 && "Great job!"}
                {selfRating === 5 && "Perfect performance!"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Community will rate this blind - let's see how you compare!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Progress */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {getUploadStateIcon()}
            Upload Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">{getUploadStateMessage()}</span>
            {uploadState === 'uploading' && uploadProgress && (
              <span className="text-sm text-gray-400">
                {uploadProgress.progress}%
              </span>
            )}
          </div>
          
          {uploadProgress && (
            <Progress 
              value={uploadProgress.progress} 
              className="h-2"
            />
          )}
          
          {error && (
            <Alert className="bg-red-500/20 border-red-500/50">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {uploadState === 'error' && (
          <Button
            onClick={retryUpload}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry Upload
          </Button>
        )}
        
        {uploadState === 'idle' && selfRating > 0 && (
          <Button
            onClick={handleSubmitWithRating}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Upload className="w-4 h-4 mr-2" />
            Submit Performance
          </Button>
        )}
        
        {uploadState === 'success' && uploadResult && (
          <>
            {canShare && (
              <Button
                onClick={handleShare}
                disabled={isSharing}
                variant="outline"
                className="flex-1"
              >
                {isSharing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4 mr-2" />
                )}
                Share to Farcaster
              </Button>
            )}
            
            <Button
              onClick={handleContinue}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue to Feed
            </Button>
          </>
        )}
      </div>

      {/* Share Status */}
      {shareSuccess && (
        <Alert className="bg-green-500/20 border-green-500/50">
          <CheckCircle className="w-4 h-4" />
          <AlertDescription className="text-green-300">
            Successfully shared to Farcaster! 🎉
          </AlertDescription>
        </Alert>
      )}
      
      {shareError && (
        <Alert className="bg-red-500/20 border-red-500/50">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-red-300">
            {shareError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}