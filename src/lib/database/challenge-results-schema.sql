-- Challenge Results Table Schema
-- Run this in your Supabase SQL editor to create the required table

-- Create challenge_results table
CREATE TABLE IF NOT EXISTS challenge_results (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  challenge_title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  self_rating DECIMAL(3,1) NOT NULL CHECK (self_rating >= 1 AND self_rating <= 10),
  confidence TEXT NOT NULL CHECK (confidence IN ('nervous', 'confident', 'very confident')),
  duration INTEGER NOT NULL, -- Duration in seconds
  user_fid INTEGER, -- Farcaster ID
  cast_hash TEXT, -- Farcaster cast hash if shared
  accuracy DECIMAL(5,2), -- Performance accuracy percentage
  community_rating DECIMAL(3,1), -- Community rating (filled later)
  gap DECIMAL(3,1), -- Reality gap (self vs community)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  viral_score INTEGER DEFAULT 0, -- 0-100 viral score
  coin_address TEXT, -- Zora coin address if created
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenge_results_challenge_id ON challenge_results(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_results_user_fid ON challenge_results(user_fid);
CREATE INDEX IF NOT EXISTS idx_challenge_results_created_at ON challenge_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_results_viral_score ON challenge_results(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_results_community_rating ON challenge_results(community_rating DESC);

-- Create challenge_stats table for tracking participation
CREATE TABLE IF NOT EXISTS challenge_stats (
  challenge_id TEXT PRIMARY KEY,
  participants_count INTEGER DEFAULT 0,
  total_submissions INTEGER DEFAULT 0,
  average_self_rating DECIMAL(3,1),
  average_community_rating DECIMAL(3,1),
  highest_rated_submission_id TEXT,
  most_viral_submission_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to increment challenge participants
CREATE OR REPLACE FUNCTION increment_challenge_participants(challenge_id TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO challenge_stats (challenge_id, participants_count, total_submissions)
  VALUES (challenge_id, 1, 1)
  ON CONFLICT (challenge_id) 
  DO UPDATE SET 
    participants_count = challenge_stats.participants_count + 1,
    total_submissions = challenge_stats.total_submissions + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update challenge statistics
CREATE OR REPLACE FUNCTION update_challenge_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update average ratings and find top submissions
  UPDATE challenge_stats 
  SET 
    average_self_rating = (
      SELECT AVG(self_rating) 
      FROM challenge_results 
      WHERE challenge_id = NEW.challenge_id
    ),
    average_community_rating = (
      SELECT AVG(community_rating) 
      FROM challenge_results 
      WHERE challenge_id = NEW.challenge_id AND community_rating IS NOT NULL
    ),
    highest_rated_submission_id = (
      SELECT id 
      FROM challenge_results 
      WHERE challenge_id = NEW.challenge_id AND community_rating IS NOT NULL
      ORDER BY community_rating DESC, self_rating DESC 
      LIMIT 1
    ),
    most_viral_submission_id = (
      SELECT id 
      FROM challenge_results 
      WHERE challenge_id = NEW.challenge_id
      ORDER BY viral_score DESC, likes_count DESC 
      LIMIT 1
    ),
    updated_at = NOW()
  WHERE challenge_id = NEW.challenge_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats when challenge results are updated
CREATE TRIGGER update_challenge_stats_trigger
  AFTER INSERT OR UPDATE ON challenge_results
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_stats();

-- Function to calculate reality gap
CREATE OR REPLACE FUNCTION calculate_reality_gap()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate gap when community rating is added
  IF NEW.community_rating IS NOT NULL AND OLD.community_rating IS NULL THEN
    NEW.gap = NEW.self_rating - NEW.community_rating;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate reality gap
CREATE TRIGGER calculate_reality_gap_trigger
  BEFORE UPDATE ON challenge_results
  FOR EACH ROW
  EXECUTE FUNCTION calculate_reality_gap();

-- Create RLS (Row Level Security) policies
ALTER TABLE challenge_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read challenge results
CREATE POLICY "Anyone can view challenge results" ON challenge_results
  FOR SELECT USING (true);

-- Policy: Anyone can insert challenge results (for submissions)
CREATE POLICY "Anyone can submit challenge results" ON challenge_results
  FOR INSERT WITH CHECK (true);

-- Policy: Only allow updates to specific fields (for community ratings)
CREATE POLICY "Allow community rating updates" ON challenge_results
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Policy: Anyone can read challenge stats
CREATE POLICY "Anyone can view challenge stats" ON challenge_stats
  FOR SELECT USING (true);

-- Policy: System can update challenge stats
CREATE POLICY "System can update challenge stats" ON challenge_stats
  FOR ALL USING (true);

-- Create view for leaderboard data
CREATE OR REPLACE VIEW challenge_leaderboard AS
SELECT 
  cr.id,
  cr.challenge_id,
  cr.challenge_title,
  cr.audio_url,
  cr.self_rating,
  cr.community_rating,
  cr.gap,
  cr.likes_count,
  cr.viral_score,
  cr.user_fid,
  cr.created_at,
  -- Calculate rank based on community rating
  ROW_NUMBER() OVER (
    PARTITION BY cr.challenge_id 
    ORDER BY cr.community_rating DESC NULLS LAST, cr.self_rating DESC
  ) as rank,
  -- Calculate percentile
  PERCENT_RANK() OVER (
    PARTITION BY cr.challenge_id 
    ORDER BY cr.community_rating ASC NULLS FIRST
  ) * 100 as percentile
FROM challenge_results cr
WHERE cr.community_rating IS NOT NULL
ORDER BY cr.challenge_id, rank;

-- Create view for discovery feed
CREATE OR REPLACE VIEW discovery_feed AS
SELECT 
  cr.id,
  cr.challenge_id,
  cr.challenge_title,
  cr.audio_url,
  cr.self_rating,
  cr.community_rating,
  cr.gap,
  cr.likes_count,
  cr.comments_count,
  cr.shares_count,
  cr.viral_score,
  cr.user_fid,
  cr.cast_hash,
  cr.coin_address,
  cr.created_at,
  -- Calculate trending score (recency + engagement)
  (
    cr.viral_score * 0.4 +
    (cr.likes_count + cr.comments_count * 2 + cr.shares_count * 3) * 0.3 +
    (EXTRACT(EPOCH FROM (NOW() - cr.created_at)) / 3600) * -0.3 -- Recency bonus
  ) as trending_score
FROM challenge_results cr
ORDER BY trending_score DESC, cr.created_at DESC;