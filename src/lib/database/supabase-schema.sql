-- GIGAVIBE Supabase Database Schema
-- Real database structure for user testing

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to Farcaster/wallet addresses)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  farcaster_fid INTEGER,
  display_name TEXT,
  pfp_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performances table (vocal recordings and metadata)
CREATE TABLE performances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_title TEXT NOT NULL,
  challenge_id TEXT,
  audio_url TEXT NOT NULL,
  audio_duration REAL,
  audio_quality TEXT CHECK (audio_quality IN ('poor', 'fair', 'good', 'excellent')),
  self_rating INTEGER CHECK (self_rating >= 1 AND self_rating <= 5),
  community_rating REAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  gap REAL GENERATED ALWAYS AS (self_rating - community_rating) STORED,
  witty_commentary TEXT,
  share_count INTEGER DEFAULT 0,
  category TEXT CHECK (category IN ('quality', 'legendary', 'comedy', 'diva', 'baritone')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community contributions table
CREATE TABLE community_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  performance_id UUID REFERENCES performances(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('voter', 'cover_artist', 'sharer', 'original_performer')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one contribution type per user per performance
  UNIQUE(performance_id, user_id, contribution_type)
);

-- Performance ratings table
CREATE TABLE performance_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  performance_id UUID REFERENCES performances(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one rating per user per performance
  UNIQUE(performance_id, user_id)
);

-- Performance coins table (when performances become tradeable)
CREATE TABLE performance_coins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  performance_id UUID REFERENCES performances(id) ON DELETE CASCADE,
  coin_address TEXT UNIQUE NOT NULL,
  coin_symbol TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  metadata_uri TEXT,
  total_supply BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Market data (updated periodically)
  current_price REAL DEFAULT 0,
  volume_24h REAL DEFAULT 0,
  market_cap REAL DEFAULT 0,
  holder_count INTEGER DEFAULT 0,
  price_change_24h REAL DEFAULT 0,
  last_market_update TIMESTAMP WITH TIME ZONE
);

-- Community ownership allocations
CREATE TABLE community_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coin_id UUID REFERENCES performance_coins(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL,
  allocation_percentage REAL NOT NULL CHECK (allocation_percentage >= 0 AND allocation_percentage <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance shares/viral tracking
CREATE TABLE performance_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  performance_id UUID REFERENCES performances(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT, -- 'farcaster', 'twitter', 'internal', etc.
  share_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cover performances (remixes/covers of original performances)
CREATE TABLE cover_performances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_performance_id UUID REFERENCES performances(id) ON DELETE CASCADE,
  cover_performance_id UUID REFERENCES performances(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no duplicate covers
  UNIQUE(original_performance_id, cover_performance_id)
);

-- Indexes for performance
CREATE INDEX idx_performances_user_id ON performances(user_id);
CREATE INDEX idx_performances_created_at ON performances(created_at DESC);
CREATE INDEX idx_performances_community_rating ON performances(community_rating DESC);
CREATE INDEX idx_performances_share_count ON performances(share_count DESC);
CREATE INDEX idx_performances_category ON performances(category);

CREATE INDEX idx_community_contributions_performance_id ON community_contributions(performance_id);
CREATE INDEX idx_community_contributions_user_id ON community_contributions(user_id);
CREATE INDEX idx_community_contributions_type ON community_contributions(contribution_type);

CREATE INDEX idx_performance_ratings_performance_id ON performance_ratings(performance_id);
CREATE INDEX idx_performance_ratings_user_id ON performance_ratings(user_id);

CREATE INDEX idx_performance_coins_performance_id ON performance_coins(performance_id);
CREATE INDEX idx_performance_coins_address ON performance_coins(coin_address);

-- Functions for updating community ratings
CREATE OR REPLACE FUNCTION update_community_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE performances 
  SET 
    community_rating = (
      SELECT COALESCE(AVG(rating::REAL), 0) 
      FROM performance_ratings 
      WHERE performance_id = NEW.performance_id
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM performance_ratings 
      WHERE performance_id = NEW.performance_id
    ),
    updated_at = NOW()
  WHERE id = NEW.performance_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update community rating when new rating is added
CREATE TRIGGER trigger_update_community_rating
  AFTER INSERT OR UPDATE OR DELETE ON performance_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_community_rating();

-- Function to update share count
CREATE OR REPLACE FUNCTION update_share_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE performances 
  SET 
    share_count = (
      SELECT COALESCE(SUM(share_count), 0) 
      FROM performance_shares 
      WHERE performance_id = NEW.performance_id
    ),
    updated_at = NOW()
  WHERE id = NEW.performance_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update share count
CREATE TRIGGER trigger_update_share_count
  AFTER INSERT OR UPDATE OR DELETE ON performance_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_share_count();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_performances ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on requirements)
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (wallet_address = current_setting('app.current_user_wallet'));

CREATE POLICY "Anyone can view performances" ON performances FOR SELECT USING (true);
CREATE POLICY "Users can create own performances" ON performances FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE wallet_address = current_setting('app.current_user_wallet')));
CREATE POLICY "Users can update own performances" ON performances FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE wallet_address = current_setting('app.current_user_wallet')));

CREATE POLICY "Anyone can view contributions" ON community_contributions FOR SELECT USING (true);
CREATE POLICY "Users can create own contributions" ON community_contributions FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE wallet_address = current_setting('app.current_user_wallet')));

CREATE POLICY "Anyone can view ratings" ON performance_ratings FOR SELECT USING (true);
CREATE POLICY "Users can create own ratings" ON performance_ratings FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE wallet_address = current_setting('app.current_user_wallet')));

CREATE POLICY "Anyone can view coins" ON performance_coins FOR SELECT USING (true);
CREATE POLICY "Anyone can view allocations" ON community_allocations FOR SELECT USING (true);
CREATE POLICY "Anyone can view shares" ON performance_shares FOR SELECT USING (true);
CREATE POLICY "Anyone can view covers" ON cover_performances FOR SELECT USING (true);