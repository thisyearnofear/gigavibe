'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Users, Trophy, Sparkles, Music, Star } from 'lucide-react';
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext';
import OnboardingLayout from '../OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card';

export default function WelcomeStep() {
  const { user } = useFarcasterAuth();

  const features = [
    {
      icon: Mic,
      title: 'Vocal Challenges',
      description: 'Record yourself singing and get real feedback'
    },
    {
      icon: Users,
      title: 'Community Judging',
      description: 'Rate others and see how you compare'
    },
    {
      icon: Trophy,
      title: 'Performance Coins',
      description: 'Viral performances become tradeable assets'
    },
    {
      icon: Sparkles,
      title: 'Reality Check',
      description: 'Discover the gap between how you think you sound vs reality'
    }
  ];

  return (
    <OnboardingLayout
      title={`Welcome to GIGAVIBE, ${user?.display_name || user?.username}! 🎤`}
      description="Where your voice becomes valuable and every performance tells a story"
      nextLabel="Let's Start!"
      showBack={false}
    >
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
          >
            <Music className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            GIGAVIBE is the first platform where vocal performances become community-owned, 
            tradeable assets on Farcaster. Ready to discover your vocal reality?
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-lg font-semibold">Ready for your vocal reality check?</span>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-gray-300">
              Let's take a quick tour of the features, then you'll record your first challenge!
            </p>
          </div>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
}