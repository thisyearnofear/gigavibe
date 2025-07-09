#!/usr/bin/env node

// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

// Supabase connection details
const SUPABASE_URL = "https://raeateoobiztkzpppvas.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_KEY) {
  console.error(
    "Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required"
  );
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  console.log("Testing Supabase connection...");

  try {
    // Test 1: Query viral thresholds (should have default values)
    console.log("\n1. Querying viral thresholds:");
    const { data: thresholds, error: thresholdsError } = await supabase
      .from("viral_thresholds")
      .select("*");

    if (thresholdsError) throw thresholdsError;
    console.log(`✓ Successfully retrieved ${thresholds.length} thresholds`);
    console.log(thresholds);

    // Test 2: Insert a test user
    console.log("\n2. Inserting test user:");
    const testUser = {
      wallet_address: "0xTestWallet" + Date.now(), // Make unique
      display_name: "Test User",
      bio: "This is a test user created to verify database functionality",
    };

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert(testUser)
      .select()
      .single();

    if (userError) throw userError;
    console.log("✓ Successfully inserted test user:");
    console.log(user);

    // Test 3: Insert a test performance
    console.log("\n3. Inserting test performance:");
    const testPerformance = {
      farcaster_cast_id: "test-cast-" + Date.now(), // Make unique
      user_id: user.id,
      title: "Test Performance",
      content: "This is a test performance",
      audio_url: "https://example.com/test.mp3",
      audio_duration: 120.5,
    };

    const { data: performance, error: performanceError } = await supabase
      .from("performances")
      .insert(testPerformance)
      .select()
      .single();

    if (performanceError) throw performanceError;
    console.log("✓ Successfully inserted test performance:");
    console.log(performance);

    // Test 4: Clean up test data
    console.log("\n4. Cleaning up test data:");
    const { error: deleteError } = await supabase
      .from("performances")
      .delete()
      .eq("id", performance.id);

    if (deleteError) throw deleteError;

    const { error: deleteUserError } = await supabase
      .from("users")
      .delete()
      .eq("id", user.id);

    if (deleteUserError) throw deleteUserError;

    console.log("✓ Successfully cleaned up test data");

    console.log("\n✅ All tests passed! The database is working correctly.");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testConnection();
