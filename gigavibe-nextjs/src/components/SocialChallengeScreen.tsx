'use client';

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useFilCDN } from '@/providers/FilCDNProvider';
import { usePitchDetection } from '@/hooks/usePitchDetection';
import { useChallenge } from '@/hooks/useChallenge';
import { AIChallengeGenerator } from '@/lib/aiChallengeGenerator';
import { Play, Pause, Share, Trophy, Users, Zap } from 'lucide-react';

interface ChallengeResult {
  challengeId: string;
  score: number;
  accuracy: number;
  completionTime: number;
  recording?: string; // CID of vocal recording
}

export default function SocialChallengeScreen() {
  const { context } = useMiniKit();
  const { uploadFile } = useFilCDN();
  const {
    pitchData,
    isListening,
    startListening,
    stopListening,
  } = usePitchDetection();
  const {
    currentChallenge,
    challengeProgress,
    startChallenge,
  } = useChallenge();

  const [challengeGenerator] = useState(() => new AIChallengeGenerator());
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [challengeResult, setChallengeResult] = useState<ChallengeResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Generate daily challenge on mount
  useEffect(() => {
    const challenge = challengeGenerator.generateDailyChallenge();
    setDailyChallenge(challenge);
  }, [challengeGenerator]);

  // Handle challenge completion
  useEffect(() => {
    if (challengeProgress.isComplete && currentChallenge) {
      handleChallengeComplete();
    }
  }, [challengeProgress.isComplete]);

  const handleChallengeComplete = async () => {
    if (!currentChallenge) return;

    const result: ChallengeResult = {
      challengeId: currentChallenge.id,
      score: challengeProgress.score,
      accuracy: (challengeProgress.notesHit.filter(Boolean).length / challengeProgress.notesHit.length) * 100,
      completionTime: Date.now() - challengeProgress.startTime,
    };

    setChallengeResult(result);
    stopListening();
    setIsRecording(false);

    // Store result on FilCDN for decentralized leaderboard
    await storeResultOnFilCDN(result);
  };

  const storeResultOnFilCDN = async (result: ChallengeResult) => {
    try {
      const resultData = JSON.stringify({
        ...result,
        userFid: context?.user?.fid,
        timestamp: Date.now(),
      });
      
      const buffer = new TextEncoder().encode(resultData);
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
      const cid = await uploadFile(arrayBuffer);
      
      console.log('Challenge result stored on FilCDN:', cid);
      // TODO: Update leaderboard with new result
    } catch (error) {
      console.error('Failed to store result:', error);
    }
  };

  const startChallengeWithRecording = async () => {
    if (!dailyChallenge) return;

    setIsRecording(true);
    await startListening();
    startChallenge(dailyChallenge);
  };

  const shareToFarcaster = async () => {
    if (!challengeResult || !currentChallenge) return;

    const shareText = `${currentChallenge.socialPrompt}\n\nScore: ${Math.round(challengeResult.score)}/100\nAccuracy: ${Math.round(challengeResult.accuracy)}%\n\nTry it yourself on GIGAVIBE! 🎵`;
    
    // This would use MiniKit's sharing capabilities
    console.log('Sharing to Farcaster:', shareText);
    // TODO: Implement actual Farcaster sharing via MiniKit
  };

  const generateNewChallenge = () => {
    const newChallenge = challengeGenerator.generateDailyChallenge();
    setDailyChallenge(newChallenge);
    setChallengeResult(null);
  };

  if (!dailyChallenge) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Challenge Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Zap className="w-6 h-6" />
          <h2 className="text-xl font-bold">Daily AI Challenge</h2>
        </div>
        <h3 className="text-lg font-semibold mb-2">{dailyChallenge.title}</h3>
        <p className="text-purple-100 text-sm">{dailyChallenge.description}</p>
        
        <div className="flex items-center gap-4 mt-4">
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
            {dailyChallenge.difficulty}
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
            {dailyChallenge.type}
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
            {Math.round(dailyChallenge.estimatedDuration / 1000)}s
          </span>
        </div>
      </div>

      {/* Challenge Notes Display */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6">
        <h4 className="font-semibold text-purple-700 mb-4">Notes to Sing:</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {dailyChallenge.notes.map((note: string, index: number) => (
            <div
              key={index}
              className={`px-4 py-2 rounded-xl font-mono text-lg transition-all ${
                challengeProgress.currentNoteIndex === index && isListening
                  ? 'bg-yellow-400 text-yellow-900 scale-110'
                  : challengeProgress.notesHit[index]
                  ? 'bg-green-400 text-green-900'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {note}
            </div>
          ))}
        </div>

        {/* Real-time Pitch Display */}
        {isListening && (
          <div className="bg-white/30 rounded-2xl p-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-purple-700">
                {pitchData.note}{pitchData.octave}
              </div>
              <div className="text-sm text-gray-600">
                {pitchData.frequency.toFixed(1)} Hz
              </div>
              <div className={`text-sm font-medium ${
                pitchData.isInTune ? 'text-green-600' : 'text-orange-600'
              }`}>
                {pitchData.cents > 0 ? '+' : ''}{pitchData.cents} cents
              </div>
              
              {/* Volume indicator */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, pitchData.volume)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Challenge Controls */}
        <div className="flex justify-center gap-4">
          {!isListening && !challengeResult ? (
            <button
              onClick={startChallengeWithRecording}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5" />
              Start Challenge
            </button>
          ) : isListening ? (
            <button
              onClick={() => {
                stopListening();
                setIsRecording(false);
              }}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:scale-105 transition-all"
            >
              <Pause className="w-5 h-5" />
              Stop Challenge
            </button>
          ) : null}

          <button
            onClick={generateNewChallenge}
            className="bg-white/20 backdrop-blur-sm text-purple-700 px-6 py-3 rounded-2xl font-semibold hover:bg-white/30 transition-all"
          >
            New Challenge
          </button>
        </div>
      </div>

      {/* Challenge Result */}
      {challengeResult && (
        <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6" />
            <h3 className="text-xl font-bold">Challenge Complete!</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(challengeResult.score)}</div>
              <div className="text-sm text-green-100">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(challengeResult.accuracy)}%</div>
              <div className="text-sm text-green-100">Accuracy</div>
            </div>
          </div>

          <button
            onClick={shareToFarcaster}
            className="w-full bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition-all"
          >
            <Share className="w-5 h-5" />
            Share to Farcaster
          </button>
        </div>
      )}

      {/* Community Leaderboard Preview */}
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-purple-600" />
          <h4 className="font-semibold text-purple-700">Today's Leaderboard</h4>
        </div>
        
        <div className="space-y-2">
          {[1, 2, 3].map((rank) => (
            <div key={rank} className="flex items-center justify-between bg-white/30 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                  rank === 2 ? 'bg-gray-300 text-gray-700' :
                  'bg-orange-300 text-orange-900'
                }`}>
                  {rank}
                </div>
                <span className="font-medium text-gray-700">Anonymous Singer</span>
              </div>
              <span className="font-bold text-purple-600">{100 - rank * 5}</span>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Complete challenges to join the leaderboard!</span>
        </div>
      </div>
    </div>
  );
}
