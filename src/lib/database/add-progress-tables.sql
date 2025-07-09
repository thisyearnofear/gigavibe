-- Add back the tables needed for the useProgressData hook

-- Exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  notes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User exercise sessions table
CREATE TABLE user_exercise_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  duration INTEGER, -- in seconds
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure each achievement is unlocked only once per user
  UNIQUE(user_id, achievement_id)
);

-- Create indexes
CREATE INDEX idx_user_exercise_sessions_user_id ON user_exercise_sessions(user_id);
CREATE INDEX idx_user_exercise_sessions_exercise_id ON user_exercise_sessions(exercise_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Enable Row Level Security
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Anyone can view exercises" ON exercises FOR SELECT USING (true);
CREATE POLICY "Users can view their exercise sessions" ON user_exercise_sessions FOR SELECT USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY "Users can create their exercise sessions" ON user_exercise_sessions FOR INSERT WITH CHECK (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can view their achievements" ON user_achievements FOR SELECT USING (user_id::text = auth.jwt() ->> 'sub');