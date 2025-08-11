"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Users, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Phone, 
  PhoneOff, 
  Settings,
  Crown,
  Hand,
  Music,
  Headphones,
  UserPlus,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

export interface AudioRoom {
  id: string;
  title: string;
  description: string;
  host: RoomParticipant;
  participants: RoomParticipant[];
  maxParticipants: number;
  isPrivate: boolean;
  currentSong?: {
    title: string;
    artist: string;
    audioUrl: string;
    duration: number;
  };
  status: 'waiting' | 'active' | 'listening' | 'performing';
  createdAt: Date;
  tags: string[];
}

export interface RoomParticipant {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  role: 'host' | 'speaker' | 'listener';
  isMuted: boolean;
  isHandRaised: boolean;
  joinedAt: Date;
  isConnected: boolean;
}

interface SocialAudioRoomsProps {
  onJoinRoom?: (room: AudioRoom) => void;
  onCreateRoom?: () => void;
  userFid?: number;
  className?: string;
}

export default function SocialAudioRooms({
  onJoinRoom,
  onCreateRoom,
  userFid,
  className
}: SocialAudioRoomsProps) {
  const [rooms, setRooms] = useState<AudioRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<AudioRoom | null>(null);
  const [isInRoom, setIsInRoom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showRoomControls, setShowRoomControls] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'joined'>('discover');
  
  // Mobile optimization
  const [touchStartY, setTouchStartY] = useState(0);
  const [isSwipeGesture, setIsSwipeGesture] = useState(false);
  const roomControlsRef = useRef<HTMLDivElement>(null);
  
  // Farcaster MiniKit integration
  const { isFrameReady } = useMiniKit();

  // Mock data for demonstration
  useEffect(() => {
    const mockRooms: AudioRoom[] = [
      {
        id: 'room-1',
        title: '🎤 Late Night Karaoke',
        description: 'Chill vibes and great voices',
        host: {
          fid: 123,
          username: 'karaoke_queen',
          displayName: 'Sarah M.',
          pfpUrl: '/api/placeholder/40/40',
          role: 'host',
          isMuted: false,
          isHandRaised: false,
          joinedAt: new Date(),
          isConnected: true
        },
        participants: [
          {
            fid: 456,
            username: 'singer_pro',
            displayName: 'Mike R.',
            pfpUrl: '/api/placeholder/40/40',
            role: 'speaker',
            isMuted: false,
            isHandRaised: false,
            joinedAt: new Date(),
            isConnected: true
          },
          {
            fid: 789,
            username: 'music_lover',
            displayName: 'Emma K.',
            pfpUrl: '/api/placeholder/40/40',
            role: 'listener',
            isMuted: true,
            isHandRaised: true,
            joinedAt: new Date(),
            isConnected: true
          }
        ],
        maxParticipants: 12,
        isPrivate: false,
        currentSong: {
          title: 'Bohemian Rhapsody',
          artist: 'Queen',
          audioUrl: '/audio/bohemian-rhapsody.mp3',
          duration: 355
        },
        status: 'active',
        createdAt: new Date(),
        tags: ['karaoke', 'rock', 'classics']
      },
      {
        id: 'room-2',
        title: '🎵 R&B Vocal Sessions',
        description: 'Smooth vocals and soulful performances',
        host: {
          fid: 321,
          username: 'rnb_master',
          displayName: 'Alex J.',
          pfpUrl: '/api/placeholder/40/40',
          role: 'host',
          isMuted: false,
          isHandRaised: false,
          joinedAt: new Date(),
          isConnected: true
        },
        participants: [
          {
            fid: 654,
            username: 'soul_singer',
            displayName: 'Lisa P.',
            pfpUrl: '/api/placeholder/40/40',
            role: 'speaker',
            isMuted: false,
            isHandRaised: false,
            joinedAt: new Date(),
            isConnected: true
          }
        ],
        maxParticipants: 8,
        isPrivate: false,
        status: 'waiting',
        createdAt: new Date(),
        tags: ['rnb', 'soul', 'vocals']
      }
    ];
    setRooms(mockRooms);
  }, []);

  // Mobile touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setIsSwipeGesture(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartY) return;
    
    const currentY = e.touches[0].clientY;
    const diffY = touchStartY - currentY;
    
    if (Math.abs(diffY) > 10) {
      setIsSwipeGesture(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartY || !isSwipeGesture) return;
    
    const currentY = e.changedTouches[0].clientY;
    const diffY = touchStartY - currentY;
    
    // Swipe up to show room controls
    if (diffY > 50 && isInRoom) {
      setShowRoomControls(true);
    }
    // Swipe down to hide room controls
    else if (diffY < -50 && showRoomControls) {
      setShowRoomControls(false);
    }
    
    setTouchStartY(0);
    setIsSwipeGesture(false);
  };

  const handleJoinRoom = (room: AudioRoom) => {
    setCurrentRoom(room);
    setIsInRoom(true);
    onJoinRoom?.(room);
    
    // Mobile haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([10, 5, 10]);
    }
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setIsInRoom(false);
    setShowRoomControls(false);
    setIsMuted(false);
    setIsHandRaised(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    if (navigator.vibrate) {
      navigator.vibrate([10, 10, 10]);
    }
  };

  // Mobile-optimized room interface
  if (isInRoom && currentRoom) {
    return (
      <div 
        className={cn("fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-50", className)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Room Header - Mobile Optimized */}
        <div className="relative p-4 bg-black/40 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white truncate">{currentRoom.title}</h2>
              <p className="text-sm text-white/60 truncate">{currentRoom.description}</p>
            </div>
            <Button
              onClick={handleLeaveRoom}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-2"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Participant count */}
          <div className="flex items-center gap-2 mt-2">
            <Users className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/60">
              {currentRoom.participants.length + 1}/{currentRoom.maxParticipants}
            </span>
            {currentRoom.currentSong && (
              <>
                <Music className="w-4 h-4 text-gigavibe-400 ml-2" />
                <span className="text-sm text-gigavibe-400 truncate flex-1">
                  {currentRoom.currentSong.title} - {currentRoom.currentSong.artist}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Participants Grid - Mobile Optimized */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {/* Host */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-black/20 backdrop-blur-sm border-gigavibe-500/30 p-4">
                <div className="text-center space-y-2">
                  <div className="relative">
                    <Avatar className="w-16 h-16 mx-auto border-2 border-gigavibe-500">
                      <AvatarImage src={currentRoom.host.pfpUrl} />
                      <AvatarFallback className="bg-gigavibe-600 text-white">
                        {currentRoom.host.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Crown className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400" />
                    {!currentRoom.host.isMuted && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm truncate">
                      {currentRoom.host.displayName}
                    </p>
                    <Badge className="text-xs bg-gigavibe-500/20 text-gigavibe-400 border-gigavibe-500/30">
                      Host
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Other Participants */}
            {currentRoom.participants.map((participant, index) => (
              <motion.div
                key={participant.fid}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * (index + 2) }}
              >
                <Card className="bg-black/20 backdrop-blur-sm border-white/10 p-4">
                  <div className="text-center space-y-2">
                    <div className="relative">
                      <Avatar className="w-16 h-16 mx-auto border-2 border-white/20">
                        <AvatarImage src={participant.pfpUrl} />
                        <AvatarFallback className="bg-gray-600 text-white">
                          {participant.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {participant.isHandRaised && (
                        <Hand className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400" />
                      )}
                      {!participant.isMuted && participant.role === 'speaker' && (
                        <motion.div
                          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                      {participant.isMuted && (
                        <MicOff className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 text-red-400 bg-black rounded-full p-0.5" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm truncate">
                        {participant.displayName}
                      </p>
                      <Badge 
                        className={cn(
                          "text-xs",
                          participant.role === 'speaker' 
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        )}
                      >
                        {participant.role}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* Empty Slots */}
            {Array.from({ 
              length: Math.max(0, Math.min(6, currentRoom.maxParticipants - currentRoom.participants.length - 1))
            }).map((_, i) => (
              <Card key={i} className="bg-black/10 backdrop-blur-sm border-dashed border-white/20 p-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto border-2 border-dashed border-white/20 rounded-full flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-white/40" />
                  </div>
                  <p className="text-white/40 text-sm">Empty</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Controls - Mobile Optimized */}
        <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/10">
          <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
            <Button
              onClick={toggleMute}
              className={cn(
                "w-14 h-14 rounded-full transition-all duration-200",
                isMuted 
                  ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25" 
                  : "bg-white/10 hover:bg-white/20 border border-white/20"
              )}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </Button>

            <Button
              onClick={toggleHandRaise}
              className={cn(
                "w-14 h-14 rounded-full transition-all duration-200",
                isHandRaised 
                  ? "bg-yellow-500 hover:bg-yellow-600 shadow-lg shadow-yellow-500/25" 
                  : "bg-white/10 hover:bg-white/20 border border-white/20"
              )}
            >
              <Hand className="w-6 h-6 text-white" />
            </Button>

            <Button
              onClick={() => setShowRoomControls(!showRoomControls)}
              className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/20"
            >
              <MoreVertical className="w-6 h-6 text-white" />
            </Button>
          </div>
          
          {/* Swipe hint */}
          <motion.p
            className="text-center text-white/40 text-xs mt-2"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Swipe up for more controls
          </motion.p>
        </div>

        {/* Extended Controls Sheet - Mobile Optimized */}
        <AnimatePresence>
          {showRoomControls && (
            <motion.div
              ref={roomControlsRef}
              className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 rounded-t-3xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) {
                  setShowRoomControls(false);
                }
              }}
            >
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mt-3 mb-4" />
              
              <div className="p-6 space-y-4">
                <h3 className="text-white font-semibold text-center">Room Controls</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Audio
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
                
                <Button
                  onClick={handleLeaveRoom}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  <PhoneOff className="w-4 h-4 mr-2" />
                  Leave Room
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Room discovery interface - Mobile Optimized
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white">Audio Rooms</h2>
        <p className="text-white/60 text-sm">Join live listening parties and vocal sessions</p>
      </div>

      {/* Tabs - Mobile Optimized */}
      <div className="flex gap-1 bg-black/20 backdrop-blur-sm rounded-xl p-1 border border-white/10">
        {[
          { id: 'discover', label: 'Discover', icon: Headphones },
          { id: 'joined', label: 'Joined', icon: Users }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 text-sm",
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

      {/* Create Room Button - Mobile Optimized */}
      <Button
        onClick={onCreateRoom}
        className="w-full bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 py-3"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Create Audio Room
      </Button>

      {/* Rooms List - Mobile Optimized */}
      <div className="space-y-3">
        {rooms.map(room => (
          <motion.div
            key={room.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="bg-black/20 backdrop-blur-sm border-white/10 hover:border-gigavibe-500/30 transition-all duration-300 cursor-pointer"
              onClick={() => handleJoinRoom(room)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Room Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{room.title}</h3>
                      <p className="text-white/60 text-sm truncate">{room.description}</p>
                    </div>
                    <Badge 
                      className={cn(
                        "text-xs ml-2",
                        room.status === 'active' ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        room.status === 'waiting' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                        "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      )}
                    >
                      {room.status}
                    </Badge>
                  </div>

                  {/* Participants Preview */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <Avatar className="w-6 h-6 border border-black">
                          <AvatarImage src={room.host.pfpUrl} />
                          <AvatarFallback className="bg-gigavibe-600 text-white text-xs">
                            {room.host.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {room.participants.slice(0, 2).map(participant => (
                          <Avatar key={participant.fid} className="w-6 h-6 border border-black">
                            <AvatarImage src={participant.pfpUrl} />
                            <AvatarFallback className="bg-gray-600 text-white text-xs">
                              {participant.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {room.participants.length > 2 && (
                          <div className="w-6 h-6 bg-white/20 rounded-full border border-black flex items-center justify-center">
                            <span className="text-white text-xs">+{room.participants.length - 2}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-white/60 text-sm">
                        {room.participants.length + 1}/{room.maxParticipants}
                      </span>
                    </div>

                    {room.currentSong && (
                      <div className="flex items-center gap-1 text-gigavibe-400">
                        <Music className="w-4 h-4" />
                        <span className="text-xs truncate max-w-20">
                          {room.currentSong.title}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {room.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {room.tags.slice(0, 3).map(tag => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="text-xs border-white/20 text-white/60"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}