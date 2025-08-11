"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mic, Play, Clock, Star, Trophy, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface CollaborativeChallenge {
  id: string;
  title: string;
  type: 'duet' | 'harmony' | 'group' | 'relay';
  maxParticipants: number;
  currentParticipants: number;
  participants: Participant[];
  creator: Participant;
  status: 'waiting' | 'active' | 'recording' | 'completed';
  timeLimit?: number; // in seconds
  targetNote?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: number; // coins
  createdAt: Date;
  startsAt?: Date;
}

export interface Participant {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  role?: 'lead' | 'harmony' | 'backing';
  hasRecorded?: boolean;
  audioUrl?: string;
  joinedAt: Date;
}

interface ChallengeLobbyProps {
  onJoinChallenge?: (challenge: CollaborativeChallenge) => void;
  onCreateChallenge?: () => void;
  userFid?: number;
  className?: string;
}

export default function CollaborativeChallenges({
  onJoinChallenge,
  onCreateChallenge,
  userFid,
  className
}: ChallengeLobbyProps) {
  const [challenges, setChallenges] = useState<CollaborativeChallenge[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'joined' | 'create'>('available');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockChallenges: CollaborativeChallenge[] = [
      {
        id: '1',
        title: 'Bohemian Rhapsody Harmony',
        type: 'harmony',
        maxParticipants: 4,
        currentParticipants: 2,
        participants: [
          {
            fid: 123,
            username: 'vocalist1',
            displayName: 'Sarah M.',
            pfpUrl: '/api/placeholder/40/40',
            role: 'lead',
            hasRecorded: true,
            joinedAt: new Date()
          },
          {
            fid: 456,
            username: 'harmony_king',
            displayName: 'Mike R.',
            pfpUrl: '/api/placeholder/40/40',
            role: 'harmony',
            hasRecorded: false,
            joinedAt: new Date()
          }
        ],
        creator: {
          fid: 123,
          username: 'vocalist1',
          displayName: 'Sarah M.',
          pfpUrl: '/api/placeholder/40/40',
          joinedAt: new Date()
        },
        status: 'waiting',
        timeLimit: 180,
        difficulty: 'hard',
        reward: 50,
        createdAt: new Date(),
        startsAt: new Date(Date.now() + 300000) // 5 minutes from now
      },
      {
        id: '2',
        title: 'Perfect Duet Challenge',
        type: 'duet',
        maxParticipants: 2,
        currentParticipants: 1,
        participants: [
          {
            fid: 789,
            username: 'duet_master',
            displayName: 'Alex K.',
            pfpUrl: '/api/placeholder/40/40',
            role: 'lead',
            hasRecorded: true,
            joinedAt: new Date()
          }
        ],
        creator: {
          fid: 789,
          username: 'duet_master',
          displayName: 'Alex K.',
          pfpUrl: '/api/placeholder/40/40',
          joinedAt: new Date()
        },
        status: 'waiting',
        difficulty: 'medium',
        reward: 30,
        createdAt: new Date()
      },
      {
        id: '3',
        title: 'Vocal Relay Race',
        type: 'relay',
        maxParticipants: 6,
        currentParticipants: 4,
        participants: [
          {
            fid: 111,
            username: 'relay1',
            displayName: 'Emma S.',
            pfpUrl: '/api/placeholder/40/40',
            hasRecorded: true,
            joinedAt: new Date()
          },
          {
            fid: 222,
            username: 'relay2',
            displayName: 'John D.',
            pfpUrl: '/api/placeholder/40/40',
            hasRecorded: true,
            joinedAt: new Date()
          },
          {
            fid: 333,
            username: 'relay3',
            displayName: 'Lisa P.',
            pfpUrl: '/api/placeholder/40/40',
            hasRecorded: false,
            joinedAt: new Date()
          },
          {
            fid: 444,
            username: 'relay4',
            displayName: 'Tom W.',
            pfpUrl: '/api/placeholder/40/40',
            hasRecorded: false,
            joinedAt: new Date()
          }
        ],
        creator: {
          fid: 111,
          username: 'relay1',
          displayName: 'Emma S.',
          pfpUrl: '/api/placeholder/40/40',
          joinedAt: new Date()
        },
        status: 'active',
        timeLimit: 60,
        difficulty: 'easy',
        reward: 20,
        createdAt: new Date()
      }
    ];

    setChallenges(mockChallenges);
  }, []);

  const getTypeIcon = (type: CollaborativeChallenge['type']) => {
    switch (type) {
      case 'duet': return '👥';
      case 'harmony': return '🎵';
      case 'group': return '👨‍👩‍👧‍👦';
      case 'relay': return '🏃‍♂️';
      default: return '🎤';
    }
  };

  const getTypeColor = (type: CollaborativeChallenge['type']) => {
    switch (type) {
      case 'duet': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'harmony': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'group': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'relay': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: CollaborativeChallenge['status']) => {
    switch (status) {
      case 'waiting': return 'text-yellow-400';
      case 'active': return 'text-green-400';
      case 'recording': return 'text-red-400';
      case 'completed': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const handleJoinChallenge = (challenge: CollaborativeChallenge) => {
    if (challenge.currentParticipants >= challenge.maxParticipants) return;
    
    // Add user to challenge participants
    const updatedChallenge = {
      ...challenge,
      currentParticipants: challenge.currentParticipants + 1,
      participants: [
        ...challenge.participants,
        {
          fid: userFid || 999,
          username: 'current_user',
          displayName: 'You',
          pfpUrl: '/api/placeholder/40/40',
          joinedAt: new Date()
        }
      ]
    };

    setChallenges(prev => 
      prev.map(c => c.id === challenge.id ? updatedChallenge : c)
    );

    onJoinChallenge?.(updatedChallenge);
  };

  const filteredChallenges = challenges.filter(challenge => {
    switch (activeTab) {
      case 'available':
        return challenge.status === 'waiting' && 
               challenge.currentParticipants < challenge.maxParticipants &&
               !challenge.participants.some(p => p.fid === userFid);
      case 'joined':
        return challenge.participants.some(p => p.fid === userFid);
      default:
        return false;
    }
  });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Collaborative Challenges</h2>
        <p className="text-white/60">Join others for duets, harmonies, and group performances</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-black/20 backdrop-blur-sm rounded-xl p-1 border border-white/10">
        {[
          { id: 'available', label: 'Available', icon: Users },
          { id: 'joined', label: 'Joined', icon: Mic },
          { id: 'create', label: 'Create', icon: Plus }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200",
              activeTab === tab.id
                ? "bg-gigavibe-500 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'create' ? (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-4"
          >
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gigavibe-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Plus className="w-8 h-8 text-gigavibe-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Create New Challenge</h3>
                  <p className="text-white/60">
                    Start a duet, harmony, or group challenge and invite others to join
                  </p>
                  <Button
                    onClick={onCreateChallenge}
                    className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {filteredChallenges.length === 0 ? (
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {activeTab === 'available' ? 'No Available Challenges' : 'No Joined Challenges'}
                  </h3>
                  <p className="text-white/60">
                    {activeTab === 'available' 
                      ? 'Check back later or create your own challenge!'
                      : 'Join some challenges to see them here!'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredChallenges.map(challenge => (
                <motion.div
                  key={challenge.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="bg-black/20 backdrop-blur-sm border-white/10 hover:border-gigavibe-500/30 transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getTypeIcon(challenge.type)}</span>
                            <CardTitle className="text-white">{challenge.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-xs", getTypeColor(challenge.type))}>
                              {challenge.type.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                              {challenge.difficulty}
                            </Badge>
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Trophy className="w-3 h-3" />
                              <span className="text-xs font-medium">{challenge.reward}</span>
                            </div>
                          </div>
                        </div>
                        <div className={cn("text-sm font-medium", getStatusColor(challenge.status))}>
                          {challenge.status.toUpperCase()}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Participants</span>
                          <span className="text-white">
                            {challenge.currentParticipants}/{challenge.maxParticipants}
                          </span>
                        </div>
                        <Progress 
                          value={(challenge.currentParticipants / challenge.maxParticipants) * 100}
                          className="h-2"
                        />
                      </div>

                      {/* Participants */}
                      <div className="space-y-2">
                        <p className="text-sm text-white/60">Participants</p>
                        <div className="flex items-center gap-2">
                          {challenge.participants.map(participant => (
                            <div key={participant.fid} className="relative">
                              <Avatar className="w-8 h-8 border-2 border-white/20">
                                <AvatarImage src={participant.pfpUrl} />
                                <AvatarFallback className="bg-gigavibe-600 text-white text-xs">
                                  {participant.displayName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {participant.hasRecorded && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-black" />
                              )}
                            </div>
                          ))}
                          {/* Empty slots */}
                          {Array.from({ length: challenge.maxParticipants - challenge.currentParticipants }).map((_, i) => (
                            <div key={i} className="w-8 h-8 border-2 border-dashed border-white/30 rounded-full flex items-center justify-center">
                              <UserPlus className="w-3 h-3 text-white/40" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Time info */}
                      {challenge.startsAt && (
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Clock className="w-4 h-4" />
                          <span>Starts in {Math.round((challenge.startsAt.getTime() - Date.now()) / 60000)} minutes</span>
                        </div>
                      )}

                      {/* Actions */}
                      {activeTab === 'available' && (
                        <Button
                          onClick={() => handleJoinChallenge(challenge)}
                          disabled={challenge.currentParticipants >= challenge.maxParticipants}
                          className="w-full bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 disabled:opacity-50"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Join Challenge
                        </Button>
                      )}

                      {activeTab === 'joined' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Listen
                          </Button>
                          <Button
                            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                          >
                            <Mic className="w-4 h-4 mr-2" />
                            Record
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}