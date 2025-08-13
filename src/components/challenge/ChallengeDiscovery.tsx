/**
 * Modular Challenge Discovery Component
 * Clean, organized component following DRY principles
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Search, 
  Filter, 
  Zap, 
  TrendingUp,
  Sparkles,
  RefreshCw,
  Star,
  Flame,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Challenge, ChallengeDiscoveryProps, ChallengeFilters } from '@/types/challenge.types';
import { useChallengeDiscovery } from '@/hooks/useUnifiedChallenge';
import ChallengeCard from './ChallengeCard';
import { FullScreenLoading } from '@/components/ui/loading';

/**
 * Challenge Discovery Component
 */
export default function ChallengeDiscovery({ 
  onChallengeSelect, 
  onViewAllChallenges,
  filters: initialFilters,
  maxItems = 10 
}: ChallengeDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ChallengeFilters>(initialFilters || {});
  const [viewMode, setViewMode] = useState<'featured' | 'trending' | 'all'>('featured');
  const [pulseIcon, setPulseIcon] = useState(false);

  const {
    challenges,
    featuredChallenges,
    trendingChallenges,
    loading,
    error,
    refreshChallenges,
    searchChallenges
  } = useChallengeDiscovery(activeFilters);

  // Pulse animation for refresh button
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIcon(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchChallenges(query);
      setViewMode('all');
    } else {
      await refreshChallenges();
      setViewMode('featured');
    }
  };

  const handleFilterChange = (key: keyof ChallengeFilters, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    // Filters will trigger a reload via the hook dependency
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setViewMode('featured');
  };

  const getCurrentChallenges = (): Challenge[] => {
    switch (viewMode) {
      case 'featured':
        return featuredChallenges.slice(0, maxItems);
      case 'trending':
        return trendingChallenges.slice(0, maxItems);
      case 'all':
      default:
        return challenges.slice(0, maxItems);
    }
  };

  const hasActiveFilters = Object.keys(activeFilters).some(key => 
    activeFilters[key as keyof ChallengeFilters] !== undefined
  );

  if (loading && getCurrentChallenges().length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Loading Challenges</h2>
          <p className="text-slate-400">Finding the perfect vocal challenges for you</p>
        </div>
        <FullScreenLoading message="Loading challenges..." showLogo={false} />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="gigavibe-glass-dark border-red-500/20">
          <CardContent className="p-6 text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Zap className="w-12 h-12 text-red-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-red-400 mb-4">{error}</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={refreshChallenges}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Centered Header with animated title */}
      <div className="text-center space-y-2">
        <motion.h2 
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {viewMode === 'featured' && (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              Featured Challenges
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            </span>
          )}
          {viewMode === 'trending' && (
            <span className="flex items-center justify-center gap-2">
              <Flame className="w-6 h-6 text-red-400 animate-bounce" />
              Trending Challenges
              <Flame className="w-6 h-6 text-red-400 animate-bounce" />
            </span>
          )}
          {viewMode === 'all' && (searchQuery ? `Search: "${searchQuery}"` : 'All Challenges')}
        </motion.h2>
        <motion.p 
          className="text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {viewMode === 'featured' && 'Jump into our top vocal challenges'}
          {viewMode === 'trending' && 'What\'s hot right now'}
          {viewMode === 'all' && `${getCurrentChallenges().length} challenges found`}
        </motion.p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Centered Search Bar */}
        <div className="flex justify-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <motion.div
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Input
                placeholder="Search challenges by title, artist, or genre..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-gigavibe-500"
              />
            </motion.div>
          </div>
        </div>

        {/* Centered View Mode Tabs */}
        <div className="flex justify-center">
          <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'featured', label: 'Featured', icon: Sparkles, color: 'from-yellow-500 to-yellow-300' },
            { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'from-red-500 to-orange-500' },
            { id: 'all', label: 'All', icon: Music, color: 'from-blue-500 to-purple-500' }
          ].map(({ id, label, icon: Icon, color }) => (
            <motion.div
              key={id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={viewMode === id ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode(id as any)}
                className={`whitespace-nowrap relative overflow-hidden ${
                  viewMode === id 
                    ? `bg-gradient-to-r ${color} text-white border-0` 
                    : 'border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10'
                }`}
              >
                {viewMode === id && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                {Icon && <Icon className="w-4 h-4 mr-1" />}
                {label}
              </Button>
            </motion.div>
          ))}
          </div>
        </div>

        {/* Centered Filters */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-slate-600 text-slate-300 group"
            >
              <Filter className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform" />
              Filters
              {hasActiveFilters && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Badge className="ml-2 bg-gigavibe-500 text-white text-xs">
                    {Object.keys(activeFilters).length}
                  </Badge>
                </motion.div>
              )}
            </Button>
          </motion.div>

          {hasActiveFilters && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-400 hover:text-white"
              >
                Clear All
              </Button>
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshChallenges}
              disabled={loading}
              className="text-slate-400 hover:text-white"
            >
              <motion.div
                animate={{ 
                  rotate: loading ? 360 : (pulseIcon ? [0, 10, -10, 0] : 0)
                }}
                transition={{ 
                  duration: loading ? 1 : 0.5,
                  repeat: loading ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </motion.div>
            </Button>
          </motion.div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="gigavibe-glass-dark border-gigavibe-500/20">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Difficulty Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          Difficulty
                        </label>
                        <Select
                          value={activeFilters.difficulty || ''}
                          onValueChange={(value) => handleFilterChange('difficulty', value || undefined)}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue placeholder="Any difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any difficulty</SelectItem>
                            <SelectItem value="easy">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                Easy
                              </span>
                            </SelectItem>
                            <SelectItem value="medium">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                                Medium
                              </span>
                            </SelectItem>
                            <SelectItem value="hard">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                Hard
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Type Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white flex items-center gap-1">
                          <Music className="w-4 h-4 text-blue-400" />
                          Type
                        </label>
                        <Select
                          value={activeFilters.type || ''}
                          onValueChange={(value) => handleFilterChange('type', value || undefined)}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue placeholder="Any type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any type</SelectItem>
                            <SelectItem value="featured">Featured</SelectItem>
                            <SelectItem value="viral">Viral</SelectItem>
                            <SelectItem value="structured">Structured</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Trending Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          Status
                        </label>
                        <Select
                          value={activeFilters.trending?.toString() || ''}
                          onValueChange={(value) => handleFilterChange('trending', value === 'true' ? true : undefined)}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue placeholder="Any status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any status</SelectItem>
                            <SelectItem value="true">Trending only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Challenge Grid */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {getCurrentChallenges().length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="gigavibe-glass-dark border-gigavibe-500/20">
                <CardContent className="p-8 text-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Zap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No challenges found
                  </h3>
                  <p className="text-slate-400 mb-4">
                    {searchQuery 
                      ? `No challenges match "${searchQuery}". Try a different search term.`
                      : 'No challenges match your current filters. Try adjusting your criteria.'
                    }
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
                    >
                      Clear Filters
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div className="grid gap-4 max-w-2xl w-full mx-auto">
              {getCurrentChallenges().map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <ChallengeCard
                    challenge={challenge}
                    onSelect={onChallengeSelect}
                    variant={index === 0 && viewMode === 'featured' ? 'featured' : 'detailed'}
                    showEconomics={true}
                    showSocial={true}
                  />
                </motion.div>
              ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Load More / Quick Start CTA */}
      {getCurrentChallenges().length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="gigavibe-glass-dark border-gigavibe-500/20 bg-gradient-to-r from-gigavibe-500/10 to-purple-500/10 relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gigavibe-500 to-transparent animate-pulse"></div>
              </div>
              <CardContent className="p-6 text-center relative z-10">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Zap className="w-8 h-8 text-gigavibe-400 mx-auto mb-3" />
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Ready to go viral?
                </h3>
                <p className="text-slate-400 mb-4">
                  Start with any challenge and watch your performance climb the leaderboards
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => onChallengeSelect(getCurrentChallenges()[0])}
                      className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0 group"
                    >
                      <Sparkles className="w-4 h-4 mr-2 group-hover:animate-ping" />
                      Start Featured Challenge
                    </Button>
                  </motion.div>
                  {onViewAllChallenges && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={onViewAllChallenges}
                        variant="outline"
                        className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
                      >
                        Browse All Challenges
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}