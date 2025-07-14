"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Zap, Heart, MessageCircle, Share, Music, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { useFarcasterDiscovery, FeedType, FarcasterCast } from "@/hooks/useFarcasterDiscovery";
import { useFarcasterIntegration } from "@/hooks/useFarcasterIntegration";

interface DiscoveryFeedProps {
  initialFeedType?: FeedType;
}

export default function DiscoveryFeed({
  initialFeedType = "foryou",
}: DiscoveryFeedProps) {
  const [feedType, setFeedType] = useState<FeedType>(initialFeedType);
  const { 
    loading, 
    error, 
    feedData, 
    hasMore,
    fetchDiscoveryFeed,
    loadMore,
    refreshFeed,
    getCastMetrics,
    extractMusicEmbeds,
    isGigavibeRelated
  } = useFarcasterDiscovery();
  const { likePerformance, commentOnPerformance } = useFarcasterIntegration();

  // Load feed data on mount and when feed type changes
  useEffect(() => {
    fetchDiscoveryFeed(feedType);
  }, [feedType, fetchDiscoveryFeed]);

  // Handle cast interactions
  const handleLike = useCallback(async (castHash: string) => {
    await likePerformance(castHash);
  }, [likePerformance]);

  const handleComment = useCallback(async (castHash: string) => {
    await commentOnPerformance(castHash);
  }, [commentOnPerformance]);

  const handleShare = useCallback((cast: FarcasterCast) => {
    const shareUrl = `https://warpcast.com/${cast.author.username}/${cast.hash}`;
    navigator.clipboard.writeText(shareUrl);
  }, []);

  const handleRefresh = useCallback(() => {
    refreshFeed(feedType);
  }, [feedType, refreshFeed]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadMore(feedType);
    }
  }, [hasMore, loading, loadMore, feedType]);

  const feedTabs = [
    { id: "foryou", label: "For You", icon: Zap },
    { id: "trending", label: "Trending", icon: Music },
    { id: "following", label: "Following", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header with tabs */}
      <div className="sticky top-0 z-40 gigavibe-glass-dark border-b border-gigavibe-500/20 px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex justify-center space-x-1 flex-1">
            {feedTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = feedType === tab.id;

              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFeedType(tab.id as FeedType)}
                  className={`gap-2 transition-all duration-300 ${
                    isActive
                      ? "bg-gigavibe-500/20 text-gigavibe-400 border-gigavibe-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="text-slate-400 hover:text-white hover:bg-white/5 ml-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="px-4 py-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
            <p className="text-red-400 mb-2">Failed to load discovery feed</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Feed Content */}
      <div className="px-4 py-6 space-y-6">
        {feedData?.casts.map((cast, index) => {
          const metrics = getCastMetrics(cast);
          const musicEmbeds = extractMusicEmbeds(cast);
          const isGigavibe = isGigavibeRelated(cast);

          return (
            <motion.div
              key={cast.hash}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`gigavibe-glass-dark rounded-2xl p-6 border ${
                isGigavibe 
                  ? 'border-gigavibe-500/40 bg-gigavibe-500/5' 
                  : 'border-gigavibe-500/20'
              }`}
            >
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {cast.author.pfpUrl ? (
                    <img 
                      src={cast.author.pfpUrl} 
                      alt={cast.author.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-gigavibe-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {cast.author.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{cast.author.displayName}</p>
                    <p className="text-slate-400 text-sm">@{cast.author.username}</p>
                    {cast.channel && (
                      <span className="text-gigavibe-400 text-xs px-2 py-1 bg-gigavibe-500/20 rounded-full">
                        /{cast.channel.id}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm">
                    {new Date(cast.timestamp).toLocaleDateString()}
                  </p>
                </div>
                {isGigavibe && (
                  <div className="text-gigavibe-400 text-xs font-medium px-2 py-1 bg-gigavibe-500/20 rounded-full">
                    GIGAVIBE
                  </div>
                )}
              </div>

              {/* Cast Content */}
              <div className="mb-4">
                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                  {cast.text}
                </p>
                
                {/* Music Embeds */}
                {musicEmbeds.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {musicEmbeds.map((embed, i) => (
                      <div key={i} className="bg-black/30 rounded-lg p-3 border border-gigavibe-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Music className="w-4 h-4 text-gigavibe-400" />
                          <span className="text-white font-medium text-sm">
                            {embed.metadata?.title || 'Music Link'}
                          </span>
                        </div>
                        {embed.metadata?.description && (
                          <p className="text-slate-400 text-xs mb-2">
                            {embed.metadata.description}
                          </p>
                        )}
                        {embed.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(embed.url, '_blank')}
                            className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Open
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLike(cast.hash)}
                    className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">{metrics.likes}</span>
                  </button>

                  <button 
                    onClick={() => handleComment(cast.hash)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{metrics.replies}</span>
                  </button>

                  <button 
                    onClick={() => handleShare(cast)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <Share className="w-5 h-5" />
                    <span className="text-sm">{metrics.recasts}</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://warpcast.com/${cast.author.username}/${cast.hash}`, '_blank')}
                    className="border-slate-500/30 text-slate-400 hover:bg-slate-500/10"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  {musicEmbeds.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
                    >
                      Try This Song
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Loading state and load more */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="text-slate-400 text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading performances...
          </div>
        </div>
      )}
      
      {/* Load more button */}
      {!loading && hasMore && (
        <div className="flex justify-center py-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
          >
            Load More
          </Button>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && (!feedData?.casts || feedData.casts.length === 0) && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Music className="w-12 h-12 text-slate-400 mb-4" />
          <p className="text-slate-400 text-lg mb-2">No performances found</p>
          <p className="text-slate-500 text-sm mb-4">
            Try switching to a different feed or check back later
          </p>
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="border-gigavibe-500/30 text-gigavibe-400 hover:bg-gigavibe-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
