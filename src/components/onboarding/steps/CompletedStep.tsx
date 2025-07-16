'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Mic, Users, Search, TrendingUp, Sparkles } from 'lucide-react';
import OnboardingLayout from '../OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext';

interface CompletedStepProps {
  onComplete?: () => void;
}

export default function CompletedStep({ onComplete }: CompletedStepProps) {
  const { user } = useFarcasterAuth();

  const achievements = [
    { icon: CheckCircle, label: 'Learned the features', color: 'text-green-400' },
    { icon: Mic, label: 'Recorded first challenge', color: 'text-purple-400' },
    { icon: Users, label: 'Judged performances', color: 'text-blue-400' },
    { icon: Search, label: 'Explored discovery', color: 'text-emerald-400' },
    { icon: TrendingUp, label: 'Understood the market', color: 'text-yellow-400' }
  ];

  const nextSteps = [
    'Record your first real challenge',
    'Judge 5 community performances',
    'Explore the discovery feed',
    'Share your reality check moment'
  ];

  return (
    <OnboardingLayout
      title="Welcome to GIGAVIBE! 🎉"
      description="You're all set to start your vocal journey"
      showProgress={false}
      showSkip={false}
      showBack={false}
      showNext={false}
    >
      <div className="space-y-8 max-w-md mx-auto text-center">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="relative"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </motion.div>
        </motion.div>

        {/* Congratulations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Congratulations, {user?.display_name || user?.username}!
          </h2>
          <p className="text-gray-300">
            You've completed the GIGAVIBE tour and are ready to discover your vocal reality!
          </p>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-4">What You've Learned</h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
                    <span className="text-gray-300 text-sm">{achievement.label}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-4">Your Next Steps</h3>
              <div className="space-y-2">
                {nextSteps.map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-300 text-sm">{step}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="space-y-4"
        >
          <Button
            onClick={onComplete}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
          >
            Start My Vocal Journey! 🎤
          </Button>
          
          <p className="text-gray-400 text-xs">
            Ready to discover the gap between how you think you sound and reality?
          </p>
        </motion.div>

        {/* Fun Fact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-500/30"
        >
          <p className="text-blue-300 text-sm">
            💡 <strong>Fun Fact:</strong> 90% of people rate themselves higher than the community does. 
            What will your reality check reveal?
          </p>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
}