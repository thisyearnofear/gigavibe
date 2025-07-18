/**
 * Modular Challenge Discovery Component
 * Clean, organized component following DRY principles
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Search, 
  Filter, 
  Zap, 
  TrendingUp,
  Sparkles,
  RefreshCw
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

  const {
    challenges,
    featuredChallenges,
    trendingChallenges,
    loading,
    error,
    refreshChallenges,
    searchChallenges
  } = useChallengeDiscovery(activeFilters);

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
    return <FullScreenLoading message="Loading challenges..." showLogo={false} />;
  }

  if (error) {
    return (
      <Card className="gigavibe-glass-dark border-red-500/20">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button 
            onClick={refreshChallenges}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Centered Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          {viewMode === 'featured' && 'Featured Challenges'}
          {viewMode === 'trending' && 'Trending Challenges'}
          {viewMode === 'all' && (searchQuery ? `Search: "${searchQuery}"` : 'All Challenges')}
        </h2>
        <p className="text-slate-400">
          {viewMode === 'featured' && 'Jump into our top vocal challenges'}
          {viewMode === 'trending' && 'What\'s hot right now'}
          {viewMode === 'all' && `${getCurrentChallenges().length} challenges found`}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Centered Search Bar */}
        <div className="flex justify-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search challenges by title, artist, or genre..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-gigavibe-500"
            />
          </div>
        </div>

        {/* Centered View Mode Tabs */}
        <div className="flex justify-center">
          <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'featured', label: 'Featured', icon: Sparkles },
            { id: 'trending', label: 'Trending', icon: TrendingUp },
            { id: 'all', label: 'All', icon: null }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={viewMode === id ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(id as any)}
              className={`whitespace-nowrap ${
                viewMode === id 
                  ? 'bg-gradient-to-r from-gigavibe-500 to-purple-500 text-white border-0' 
                  : 'border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10'
              }`}
            >
              {Icon && <Icon className="w-4 h-4 mr-1" />}
              {label}
            </Button>
          ))}
          </div>
        </div>

        {/* Centered Filters */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-slate-600 text-slate-300"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-2 bg-gigavibe-500 text-white text-xs">
                {Object.keys(activeFilters).length}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-slate-400 hover:text-white"
            >
              Clear All
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={refreshChallenges}
            disabled={loading}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
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
              <Card className="gigavibe-glass-dark border-gigavibe-500/20">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Difficulty Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Difficulty</label>
                      <Select
                        value={activeFilters.difficulty || ''}
                        onValueChange={(value) => handleFilterChange('difficulty', value || undefined)}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Any difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any difficulty</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Type</label>
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
                      <label className="text-sm font-medium text-white">Status</label>
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
                  <Zap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No challenges found
                  </h3>
                  <p className="text-slate-400 mb-4">
                    {searchQuery 
                      ? `No challenges match "${searchQuery}". Try a different search term.`
                      : 'No challenges match your current filters. Try adjusting your criteria.'
                    }
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4"
            >
              {getCurrentChallenges().map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
          <Card className="gigavibe-glass-dark border-gigavibe-500/20 bg-gradient-to-r from-gigavibe-500/10 to-purple-500/10">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-gigavibe-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Ready to go viral?
              </h3>
              <p className="text-slate-400 mb-4">
                Start with any challenge and watch your performance climb the leaderboards
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => onChallengeSelect(getCurrentChallenges()[0])}
                  className="bg-gradient-to-r from-gigavibe-500 to-purple-500 hover:from-gigavibe-600 hover:to-purple-600 text-white border-0"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Featured Challenge
                </Button>
                {onViewAllChallenges && (
                  <Button
                    onClick={onViewAllChallenges}
                    variant="outline"
                    className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
                  >
                    Browse All Challenges
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}