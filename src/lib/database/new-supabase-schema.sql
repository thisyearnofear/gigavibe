-- GIGAVIBE Supabase Database Schema v2
-- Reset and create new schema specific to the current project needs

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_exercise_sessions CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS ai_usage CASCADE;
DROP TABLE IF EXISTS ai_model_configs CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to Farcaster/wallet addresses)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  farcaster_fid INTEGER UNIQUE,
  display_name TEXT,
  pfp_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performances table (vocal performances from Farcaster casts)
CREATE TABLE performances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farcaster_cast_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  audio_url TEXT,
  audio_duration REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table (engagement tracking)
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  performance_id UUID REFERENCES performances(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  recasts_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance coins table (when performances are tokenized on Zora)
CREATE TABLE performance_coins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  performance_id UUID REFERENCES performances(id) ON DELETE CASCADE,
  coin_address TEXT UNIQUE NOT NULL,
  total_supply BIGINT,
  initial_price REAL,
  current_price REAL,
  creator_allocation REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Viral detection queue
CREATE TABLE viral_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  performance_id UUID REFERENCES performances(id) ON DELETE CASCADE,
  detection_score REAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  result_message TEXT
);

-- Viral detection thresholds 
CREATE TABLE viral_thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  threshold_name TEXT UNIQUE NOT NULL,
  threshold_value REAL NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  performance_id UUID REFERENCES performances(id) ON DELETE SET NULL,
  event_data JSONB,
  client_timestamp TIMESTAMP WITH TIME ZONE,
  server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viral_notifications BOOLEAN DEFAULT TRUE,
  coin_price_notifications BOOLEAN DEFAULT TRUE,
  engagement_notifications BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User notification history
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize default viral thresholds
INSERT INTO viral_thresholds (threshold_name, threshold_value, description) VALUES
('likes_threshold', 10.0, 'Minimum likes required for viral detection'),
('replies_threshold', 5.0, 'Minimum replies required for viral detection'),
('recasts_threshold', 3.0, 'Minimum recasts required for viral detection'),
('engagement_rate', 0.05, 'Engagement rate threshold (interactions/views)'),
('growth_rate', 0.2, 'Minimum growth rate for viral detection');

-- Create indexes for performance
CREATE INDEX idx_performances_user_id ON performances(user_id);
CREATE INDEX idx_performances_created_at ON performances(created_at DESC);
CREATE INDEX idx_performance_metrics_performance_id ON performance_metrics(performance_id);
CREATE INDEX idx_viral_queue_performance_id ON viral_queue(performance_id);
CREATE INDEX idx_viral_queue_status ON viral_queue(status);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_performance_id ON analytics_events(performance_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (wallet_address = auth.jwt() ->> 'sub');

CREATE POLICY "Anyone can view performances" ON performances FOR SELECT USING (true);
CREATE POLICY "Users can view performance metrics" ON performance_metrics FOR SELECT USING (true);
CREATE POLICY "Anyone can view coins" ON performance_coins FOR SELECT USING (true);

-- Only admins can view/modify viral queue
CREATE POLICY "Admins can manage viral queue" ON viral_queue USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Admins can manage viral thresholds" ON viral_thresholds USING (auth.jwt() ->> 'role' = 'service_role');

-- Analytics policies
CREATE POLICY "Anyone can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view analytics" ON analytics_events FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- Notification policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY "Users can update own notification prefs" ON notification_preferences FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');