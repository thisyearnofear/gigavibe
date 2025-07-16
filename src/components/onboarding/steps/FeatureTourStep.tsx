'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Users, Search, TrendingUp, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import OnboardingLayout from '../OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FEATURES = [
  {
    id: 'sing',
    icon: Mic,
    title: 'Sing Tab',
    subtitle: 'Record Your Voice',
    description: 'Choose from structured challenges or freestyle recordings. Our AI analyzes your pitch, timing, and vocal quality in real-time.',
    highlights: [
      'Real-time pitch detection',
      'Structured vocal exercises',
      'AI-powered feedback',
      'Self-rating system'
    ],
    mockup: (
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-6 text-center">
        <Mic className="w-12 h-12 mx-auto mb-4 text-white" />
        <div className="w-full h-2 bg-white/20 rounded-full mb-4">
          <div className="w-3/4 h-full bg-white rounded-full"></div>
        </div>
        <p className="text-white text-sm">Recording... 🎵</p>
      </div>
    )
  },
  {
    id: 'judge',
    icon: Users,
    title: 'Judge Tab',
    subtitle: 'Rate Community Performances',
    description: 'Swipe through anonymous performances and rate them. Your votes help create the "reality check" moment for performers.',
    highlights: [
      'Tinder-style swiping',
      'Anonymous voting',
      'Community consensus',
      'Earn rewards for judging'
    ],
    mockup: (
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg p-6">
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-full"></div>
            <div className="flex-1">
              <div className="w-20 h-3 bg-white/30 rounded mb-1"></div>
              <div className="w-16 h-2 bg-white/20 rounded"></div>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✕</span>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'discover',
    icon: Search,
    title: 'Discover Tab',
    subtitle: 'Explore Viral Performances',
    description: 'TikTok-style feed of performances with reality check reveals. See the gap between self-perception and community judgment.',
    highlights: [
      'Viral performance feed',
      'Reality check reveals',
      'Social interactions',
      'Trending challenges'
    ],
    mockup: (
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="w-24 h-3 bg-white/30 rounded mb-1"></div>
                <div className="w-32 h-2 bg-white/20 rounded"></div>
              </div>
              <div className="text-white text-xs">
                {i === 1 ? '5⭐→2⭐' : i === 2 ? '3⭐→4⭐' : '1⭐→1⭐'}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'market',
    icon: TrendingUp,
    title: 'Market Tab',
    subtitle: 'Trade Performance Coins',
    description: 'When performances go viral, they become tradeable coins. Community contributors share in the ownership and profits.',
    highlights: [
      'Performance coins',
      'Community ownership',
      'Trading interface',
      'Profit sharing'
    ],
    mockup: (
      <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-semibold">Top Coins</span>
            <span className="text-white/70 text-xs">24h</span>
          </div>
          {['VOCAL-001', 'SING-042', 'EPIC-123'].map((coin, i) => (
            <div key={coin} className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-medium">{coin}</div>
                <div className="text-white/70 text-xs">Performance Coin</div>
              </div>
              <div className="text-right">
                <div className="text-white text-sm">$0.{Math.floor(Math.random() * 99) + 10}</div>
                <div className={`text-xs ${i % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {i % 2 === 0 ? '+' : '-'}{Math.floor(Math.random() * 20) + 5}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
];

export default function FeatureTourStep() {
  const [currentFeature, setCurrentFeature] = useState(0);

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % FEATURES.length);
  };

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + FEATURES.length) % FEATURES.length);
  };

  const feature = FEATURES[currentFeature];

  return (
    <OnboardingLayout
      title="Explore GIGAVIBE Features"
      description="Let's walk through the four main tabs and what makes each one special"
      nextLabel="Got it!"
      showProgress={true}
    >
      <div className="space-y-6">
        {/* Feature Navigation */}
        <div className="flex justify-center gap-2 mb-6">
          {FEATURES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentFeature(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentFeature ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Feature Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeature}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Feature Header */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{feature.title}</h2>
              <p className="text-purple-300 text-lg">{feature.subtitle}</p>
            </div>

            {/* Feature Mockup */}
            <div className="max-w-sm mx-auto">
              {feature.mockup}
            </div>

            {/* Feature Description */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <p className="text-gray-300 mb-4">{feature.description}</p>
                <div className="space-y-2">
                  {feature.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                onClick={prevFeature}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                disabled={currentFeature === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <span className="text-gray-400 text-sm">
                {currentFeature + 1} of {FEATURES.length}
              </span>
              
              <Button
                onClick={nextFeature}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                disabled={currentFeature === FEATURES.length - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </OnboardingLayout>
  );
}