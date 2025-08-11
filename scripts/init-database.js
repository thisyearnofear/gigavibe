#!/usr/bin/env node

/**
 * Database Initialization Script
 * Sets up the Supabase database with required tables and initial data
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 GigaVibe Database Initialization');
console.log('===================================');
console.log('This script will initialize your Supabase database with the required schema.');
console.log('');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Please set these in your .env.local file and try again.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to Supabase...');
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError && testError.code === '42P01') {
      console.log('⚠️  Database tables not found. Please run the SQL schema first.');
      console.log('');
      console.log('To set up your database:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the schema from: src/lib/database/new-supabase-schema.sql');
      console.log('');
      process.exit(1);
    }
    
    if (testError) {
      throw testError;
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    // Initialize viral thresholds
    console.log('🔄 Setting up viral detection thresholds...');
    
    const defaultThresholds = [
      {
        threshold_name: 'likes_threshold',
        threshold_value: 50,
        description: 'Minimum likes for viral detection'
      },
      {
        threshold_name: 'engagement_rate',
        threshold_value: 0.1,
        description: 'Minimum engagement rate (likes/views)'
      },
      {
        threshold_name: 'growth_rate',
        threshold_value: 2.0,
        description: 'Minimum growth rate multiplier'
      },
      {
        threshold_name: 'time_window',
        threshold_value: 24,
        description: 'Time window in hours for viral detection'
      }
    ];
    
    for (const threshold of defaultThresholds) {
      const { error } = await supabase
        .from('viral_thresholds')
        .upsert(threshold, { onConflict: 'threshold_name' });
      
      if (error) {
        console.warn(`⚠️  Warning: Could not set threshold ${threshold.threshold_name}:`, error.message);
      }
    }
    
    console.log('✅ Viral thresholds initialized');
    
    // Create a test user if none exist
    console.log('🔄 Checking for existing users...');
    
    const { data: existingUsers, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (userError) {
      throw userError;
    }
    
    if (existingUsers.length === 0) {
      console.log('🔄 Creating test user...');
      
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          wallet_address: '0x0000000000000000000000000000000000000000',
          farcaster_fid: 1,
          display_name: 'Test User',
          bio: 'Test user created during database initialization',
          pfp_url: '/images/default-avatar.png'
        });
      
      if (createUserError) {
        console.warn('⚠️  Warning: Could not create test user:', createUserError.message);
      } else {
        console.log('✅ Test user created');
      }
    } else {
      console.log('✅ Users table already has data');
    }
    
    // Test database functionality
    console.log('🔄 Testing database functionality...');
    
    const { data: thresholds, error: thresholdError } = await supabase
      .from('viral_thresholds')
      .select('*');
    
    if (thresholdError) {
      throw thresholdError;
    }
    
    console.log(`✅ Database test successful. Found ${thresholds.length} viral thresholds.`);
    
    console.log('');
    console.log('🎉 Database initialization completed successfully!');
    console.log('');
    console.log('Your GigaVibe database is now ready to use.');
    console.log('You can start the application with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('');
    console.error('Please check:');
    console.error('1. Your Supabase credentials are correct');
    console.error('2. Your database schema has been applied');
    console.error('3. Your network connection is stable');
    process.exit(1);
  }
}

// Ask for confirmation
rl.question('Do you want to initialize the database? (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    initializeDatabase().finally(() => {
      rl.close();
    });
  } else {
    console.log('Database initialization cancelled.');
    rl.close();
  }
});