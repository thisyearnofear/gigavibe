import { NextRequest, NextResponse } from "next/server";
import { ViralChallenge } from "@/lib/audio/SunoService";

// Sample challenge using the uploaded audio file
const featuredChallenges: ViralChallenge[] = [
  {
    id: "espanol-challenge-1",
    title: "Spanish Vocals Challenge",
    difficulty: "Medium",
    duration: 15, // Only play first 15 seconds
    originalAudio: "/audio/espanol.mp3", // Full track with vocals for reference
    instrumentalAudio: "/audio/espanol-instrumental.mp3", // Instrumental track for singing over
    vocalsOnlyAudio: "/audio/espanol.mp3", // Using full track for vocals-only for now
    prompt: "Spanish vocals with a rhythmic background",
    tags: "spanish, vocals, beginner",
  },
];

export async function GET(request: NextRequest) {
  // Get limit query parameter, default to 10
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  
  // Return limited number of challenges
  const challenges = featuredChallenges.slice(0, limit);
  
  return NextResponse.json({ 
    challenges,
    total: featuredChallenges.length,
    timestamp: new Date().toISOString()
  });
}