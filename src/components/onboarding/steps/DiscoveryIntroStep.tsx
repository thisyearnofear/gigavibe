"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  TrendingUp,
  Eye,
  Share2,
  Play,
  Star,
  Heart,
  MessageCircle,
} from "lucide-react";
import OnboardingLayout from "../OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOnboarding } from "@/contexts/OnboardingContext";

const DEMO_FEED_ITEMS = [
  {
    id: 1,
    performer: "@sarah_sings",
    challenge: "Bohemian Rhapsody",
    selfRating: 5,
    communityRating: 2,
    gap: 3,
    likes: 234,
    shares: 45,
    isViral: true,
  },
  {
    id: 2,
    performer: "@mike_music",
    challenge: "Happy Birthday",
    selfRating: 3,
    communityRating: 4,
    gap: -1,
    likes: 89,
    shares: 12,
    isViral: false,
  },
  {
    id: 3,
    performer: "@vocal_queen",
    challenge: "Amazing Grace",
    selfRating: 4,
    communityRating: 5,
    gap: -1,
    likes: 567,
    shares: 123,
    isViral: true,
  },
];

export default function DiscoveryIntroStep() {
  const [currentFeedItem, setCurrentFeedItem] = useState(0);
  const [hasExplored, setHasExplored] = useState(false);
  const { markStepCompleted } = useOnboarding();

  const nextItem = () => {
    if (currentFeedItem < DEMO_FEED_ITEMS.length - 1) {
      setCurrentFeedItem((prev) => prev + 1);
    } else {
      setHasExplored(true);
      markStepCompleted("discovery-intro");
    }
  };

  const item = DEMO_FEED_ITEMS[currentFeedItem];
  const canContinue = hasExplored;

  return (
    <OnboardingLayout
      title="Discover Viral Performances 🔥"
      description="See reality check moments and explore trending vocal challenges"
      nextLabel="Continue to Market"
      nextDisabled={!canContinue}
    >
      <div className="space-y-6 max-w-md mx-auto">
        {/* Discovery Features */}
        <Card className="bg-green-600/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Search className="w-6 h-6 text-green-400" />
              <h4 className="font-semibold text-white">Discovery Feed</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>TikTok-style vertical feed</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-400" />
                <span>Reality check reveals</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-green-400" />
                <span>Viral moment sharing</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Feed Item */}
        {!hasExplored && item && (
          <motion.div
            key={currentFeedItem}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
              <CardContent className="p-6">
                {/* Performer Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {item.performer.charAt(1).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{item.performer}</p>
                    <p className="text-gray-400 text-sm">"{item.challenge}"</p>
                  </div>
                  {item.isViral && (
                    <div className="ml-auto">
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                        🔥 VIRAL
                      </span>
                    </div>
                  )}
                </div>

                {/* Audio Visualization */}
                <div className="bg-black/20 rounded-lg p-4 mb-4 flex items-center justify-center">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 bg-purple-500 rounded"
                        animate={{ height: [8, Math.random() * 24 + 8, 8] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4 text-white hover:bg-white/10"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>

                {/* Reality Check Reveal */}
                <div className="bg-white/10 rounded-lg p-4 space-y-3">
                  <h5 className="text-white font-semibold text-center">
                    Reality Check Moment
                  </h5>

                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Self-Rating</p>
                      <div className="flex gap-1 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < item.selfRating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-white font-bold">
                        {item.selfRating}⭐
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl">→</p>
                    </div>

                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Community</p>
                      <div className="flex gap-1 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < item.communityRating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-white font-bold">
                        {item.communityRating}⭐
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p
                      className={`text-sm font-semibold ${
                        item.gap > 0
                          ? "text-red-400"
                          : item.gap < 0
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {item.gap > 0 &&
                        `Reality check! Overestimated by ${item.gap} stars 😅`}
                      {item.gap < 0 &&
                        `Underestimated! Community loved it more! 🎉`}
                      {item.gap === 0 && `Perfect self-awareness! 🎯`}
                    </p>
                  </div>
                </div>

                {/* Engagement Stats */}
                <div className="flex justify-between items-center mt-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{item.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    <span>{item.shares}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    Share Reality Check
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="text-center">
              <Button
                onClick={nextItem}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                {currentFeedItem < DEMO_FEED_ITEMS.length - 1
                  ? "Next Performance"
                  : "Explore More"}
              </Button>
              <p className="text-gray-400 text-sm mt-2">
                {currentFeedItem + 1} of {DEMO_FEED_ITEMS.length} performances
              </p>
            </div>
          </motion.div>
        )}

        {/* Completion State */}
        {hasExplored && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Discovery Mastered! 🎉
            </h3>
            <p className="text-gray-300">
              You've seen how reality check moments create viral, shareable
              content. The Discovery feed is where the magic happens!
            </p>

            <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white mb-2">
                  What You Learned:
                </h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>✓ Reality check reveals drive engagement</div>
                  <div>✓ Viral performances get more visibility</div>
                  <div>✓ Community voting creates authentic ratings</div>
                  <div>✓ Shareable moments spread organically</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </OnboardingLayout>
  );
}
