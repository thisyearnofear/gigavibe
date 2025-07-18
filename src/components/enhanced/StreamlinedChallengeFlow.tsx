"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Share2,
  Trophy,
  Zap,
  CheckCircle,
  ArrowRight,
  Clock,
  Star,
  Users,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Challenge {
  id: string;
  title: string;
  artist: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  previewUrl: string;
  instrumentalUrl: string;
  description: string;
  tips: string[];
}

interface StreamlinedChallengeFlowProps {
  challenge: Challenge;
  onComplete: (result: ChallengeResult) => void;
  onCancel: () => void;
}

interface ChallengeResult {
  challengeId: string;
  audioUrl: string;
  selfRating: number;
  confidence: string;
  duration: number;
  timestamp: Date;
}

type FlowStep = 'preview' | 'prepare' | 'countdown' | 'recording' | 'playback' | 'rating' | 'sharing';

export default function StreamlinedChallengeFlow({ 
  challenge, 
  onComplete, 
  onCancel 
}: StreamlinedChallengeFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('preview');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isPlayingInstrumental, setIsPlayingInstrumental] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdownTime, setCountdownTime] = useState(3);
  const [userRecording, setUserRecording] = useState<string | null>(null);
  const [selfRating, setSelfRating] = useState(5);
  const [confidence, setConfidence] = useState('confident');
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  // Auto-advance through countdown
  useEffect(() => {
    if (currentStep === 'countdown' && countdownTime > 0) {
      const timer = setTimeout(() => {
        setCountdownTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === 'countdown' && countdownTime === 0) {
      setCurrentStep('recording');
      setIsRecording(true);
    }
  }, [currentStep, countdownTime]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRecording]);

  const handlePreviewPlay = () => {
    setIsPlayingPreview(!isPlayingPreview);
    // In real implementation, play/pause preview audio
  };

  const handleInstrumentalPlay = () => {
    setIsPlayingInstrumental(!isPlayingInstrumental);
    // In real implementation, play/pause instrumental
  };

  const handleStartChallenge = () => {
    setCurrentStep('prepare');
  };

  const handleBeginRecording = () => {
    setCurrentStep('countdown');
    setCountdownTime(3);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setUserRecording('/mock-recording.mp3'); // Mock recording URL
    setCurrentStep('playback');
  };

  const handlePlayRecording = () => {
    setIsPlayingRecording(!isPlayingRecording);
    // In real implementation, play/pause user recording
  };

  const handleRetakeRecording = () => {
    setCurrentStep('prepare');
    setRecordingTime(0);
    setUserRecording(null);
  };

  const handleProceedToRating = () => {
    setCurrentStep('rating');
  };

  const handleSubmitRating = () => {
    setCurrentStep('sharing');
  };

  const handleComplete = () => {
    const result: ChallengeResult = {
      challengeId: challenge.id,
      audioUrl: userRecording || '',
      selfRating,
      confidence,
      duration: recordingTime,
      timestamp: new Date()
    };
    onComplete(result);
  };

  const getStepProgress = () => {
    const steps = ['preview', 'prepare', 'countdown', 'recording', 'playback', 'rating', 'sharing'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gigavibe-mesh relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/20" />
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={getStepProgress()} className="h-1 bg-black/20">
          <div className="h-full bg-gradient-to-r from-gigavibe-500 to-purple-500" />
        </Progress>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 pt-8">
        <AnimatePresence mode="wait">
          {/* Preview Step */}
          {currentStep === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto space-y-6"
            >
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-white">{challenge.title}</h1>
                <p className="text-xl text-slate-300">{challenge.artist}</p>
                <div className="flex items-center justify-center gap-4">
                  <Badge className={`${
                    challenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                    challenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {challenge.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(challenge.duration)}</span>
                  </div>
                </div>
              </div>

              <Card className="gigavibe-glass-dark border-gigavibe-500/20">
                <CardContent className="p-6 space-y-4">
                  <p className="text-slate-300 text-center">{challenge.description}</p>
                  
                  {/* Preview Audio */}
                  <div className="space-y-3">
                    <Button
                      onClick={handlePreviewPlay}
                      className="w-full bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white"
                      size="lg"
                    >
                      {isPlayingPreview ? (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Stop Preview
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Listen to Original
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleInstrumentalPlay}
                      variant="outline"
                      className="w-full border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
                      size="lg"
                    >
                      {isPlayingInstrumental ? (
                        <>
                          <VolumeX className="w-5 h-5 mr-2" />
                          Stop Instrumental
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-5 h-5 mr-2" />
                          Practice with Instrumental
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Tips */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">Quick Tips:</h3>
                    {challenge.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-slate-400">
                        <Star className="w-4 h-4 text-gigavibe-400 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartChallenge}
                  className="flex-1 bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white"
                >
                  Start Challenge
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Prepare Step */}
          {currentStep === 'prepare' && (
            <motion.div
              key="prepare"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Mic className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Get Ready to Sing!</h2>
                <p className="text-slate-300">
                  Position yourself comfortably and make sure your microphone is working
                </p>
              </div>

              <Card className="gigavibe-glass-dark border-gigavibe-500/20">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-3">
                    <div className="text-sm text-slate-400">You'll be singing along to:</div>
                    <div className="text-lg font-semibold text-white">{challenge.title}</div>
                    
                    {/* Instrumental Preview */}
                    <Button
                      onClick={handleInstrumentalPlay}
                      variant="outline"
                      className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
                    >
                      {isPlayingInstrumental ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop Practice
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Practice Once More
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep('preview')}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300"
                >
                  Back
                </Button>
                <Button
                  onClick={handleBeginRecording}
                  className="flex-1 bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              </div>
            </motion.div>
          )}

          {/* Countdown Step */}
          {currentStep === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="max-w-md mx-auto text-center space-y-8"
            >
              <h2 className="text-2xl font-bold text-white">Get Ready!</h2>
              <motion.div
                key={countdownTime}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 mx-auto bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full flex items-center justify-center"
              >
                <span className="text-6xl font-bold text-white">{countdownTime}</span>
              </motion.div>
              <p className="text-slate-300">Recording will start automatically...</p>
            </motion.div>
          )}

          {/* Recording Step */}
          {currentStep === 'recording' && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto text-center space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-32 h-32 mx-auto bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <Mic className="w-16 h-16 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white">Recording...</h2>
                <div className="text-3xl font-mono text-gigavibe-400">
                  {formatTime(recordingTime)}
                </div>
              </div>

              <Card className="gigavibe-glass-dark border-red-500/20">
                <CardContent className="p-6">
                  <p className="text-slate-300 mb-4">
                    Sing along with the instrumental track!
                  </p>
                  <div className="flex items-center justify-center gap-2 text-red-400">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">LIVE</span>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleStopRecording}
                size="lg"
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
              >
                <MicOff className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            </motion.div>
          )}

          {/* Playback Step */}
          {currentStep === 'playback' && (
            <motion.div
              key="playback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto space-y-6"
            >
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                <h2 className="text-2xl font-bold text-white">Recording Complete!</h2>
                <p className="text-slate-300">
                  Listen to your performance and decide if you want to keep it
                </p>
              </div>

              <Card className="gigavibe-glass-dark border-gigavibe-500/20">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-3">
                    <div className="text-sm text-slate-400">Your Performance</div>
                    <div className="text-lg font-semibold text-white">
                      Duration: {formatTime(recordingTime)}
                    </div>
                    
                    <Button
                      onClick={handlePlayRecording}
                      className="w-full bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white"
                    >
                      {isPlayingRecording ? (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Stop Playback
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Listen to Recording
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={handleRetakeRecording}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={handleProceedToRating}
                  className="flex-1 bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white"
                >
                  Keep Recording
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Rating Step */}
          {currentStep === 'rating' && (
            <motion.div
              key="rating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto space-y-6"
            >
              <div className="text-center space-y-4">
                <Star className="w-16 h-16 text-gigavibe-400 mx-auto" />
                <h2 className="text-2xl font-bold text-white">Rate Your Performance</h2>
                <p className="text-slate-300">
                  How do you think you did? Be honest - the community will rate you too!
                </p>
              </div>

              <Card className="gigavibe-glass-dark border-gigavibe-500/20">
                <CardContent className="p-6 space-y-6">
                  {/* Rating Slider */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gigavibe-400 mb-2">
                        {selfRating.toFixed(1)}
                      </div>
                      <div className="text-sm text-slate-400">out of 10</div>
                    </div>
                    
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.1"
                      value={selfRating}
                      onChange={(e) => setSelfRating(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Confidence Level */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">How confident are you?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['nervous', 'confident', 'very confident'].map((level) => (
                        <Button
                          key={level}
                          variant={confidence === level ? "default" : "outline"}
                          size="sm"
                          onClick={() => setConfidence(level)}
                          className={confidence === level 
                            ? "bg-gradient-to-r from-gigavibe-500 to-purple-500 text-white border-0" 
                            : "border-slate-600 text-slate-300"
                          }
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleSubmitRating}
                className="w-full bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white"
                size="lg"
              >
                Submit Rating
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Sharing Step */}
          {currentStep === 'sharing' && (
            <motion.div
              key="sharing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-gigavibe-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Challenge Complete!</h2>
                <p className="text-slate-300">
                  Your performance is ready to share with the community
                </p>
              </div>

              <Card className="gigavibe-glass-dark border-gigavibe-500/20">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-3">
                    <div className="text-sm text-slate-400">Your Self-Rating</div>
                    <div className="text-3xl font-bold text-gigavibe-400">
                      {selfRating.toFixed(1)}/10
                    </div>
                    <div className="text-sm text-slate-400 capitalize">
                      Feeling {confidence}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>Community will rate your performance</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Zap className="w-4 h-4" />
                      <span>Potential to go viral and earn coins</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Coins className="w-4 h-4" />
                      <span>High-rated performances become tradeable</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={handleComplete}
                  className="w-full bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white"
                  size="lg"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share with Community
                </Button>
                
                <Button
                  onClick={handleComplete}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300"
                >
                  Keep Private for Now
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}