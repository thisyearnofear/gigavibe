/**
 * Script to upload music files from public/audio to IPFS
 * Run this after adding your music files to public/audio/
 */

import fs from 'fs';
import path from 'path';

interface MusicFile {
  filename: string;
  title: string;
  artist: string;
  duration?: number;
  bpm?: number;
  key?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description?: string;
}

// Configuration for your music files - Starting with Español for user testing
const MUSIC_CATALOG: MusicFile[] = [
  {
    filename: 'espanol.mp3',
    title: 'Español',
    artist: 'GIGAVIBE',
    difficulty: 'medium',
    description: 'Vocal challenge with Spanish lyrics',
    duration: 180, // Approximate duration in seconds
    bpm: 120,
    key: 'C Major'
  },
  {
    filename: 'espanol-instrumental.mp3', 
    title: 'Español (Instrumental)',
    artist: 'GIGAVIBE',
    difficulty: 'medium',
    description: 'Instrumental backing track for Español',
    duration: 180,
    bpm: 120,
    key: 'C Major'
  }
];

export async function uploadMusicToIPFS() {
  console.log('🎵 Starting music upload to IPFS...');
  
  const audioDir = path.join(process.cwd(), 'public', 'audio');
  const results: Array<{file: MusicFile, ipfsResult: any}> = [];
  
  try {
    // Check if audio directory exists
    if (!fs.existsSync(audioDir)) {
      throw new Error('public/audio directory not found. Please create it and add your music files.');
    }
    
    // Process each music file
    for (const musicFile of MUSIC_CATALOG) {
      const filePath = path.join(audioDir, musicFile.filename);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${musicFile.filename}`);
        continue;
      }
      
      console.log(`📤 Uploading ${musicFile.filename}...`);
      
      try {
        // Read file and convert to base64
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');
        
        // Upload to IPFS via our API
        const response = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: musicFile.filename,
            data: base64Data,
            metadata: {
              sourceType: 'challenge-song',
              title: musicFile.title,
              artist: musicFile.artist,
              difficulty: musicFile.difficulty,
              description: musicFile.description,
              duration: musicFile.duration,
              bpm: musicFile.bpm,
              key: musicFile.key,
              timestamp: Date.now()
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }
        
        const result = await response.json();
        results.push({ file: musicFile, ipfsResult: result });
        
        console.log(`✅ ${musicFile.filename} uploaded successfully`);
        console.log(`   IPFS Hash: ${result.ipfsHash}`);
        console.log(`   URL: ${result.url}`);
        
      } catch (error) {
        console.error(`❌ Failed to upload ${musicFile.filename}:`, error);
      }
    }
    
    // Generate challenge configuration
    console.log('\n🎯 Generating challenge configuration...');
    const challengeConfig = results.map(({ file, ipfsResult }) => ({
      id: `challenge-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      title: file.title,
      artist: file.artist,
      audioUrl: ipfsResult.url,
      ipfsHash: ipfsResult.ipfsHash,
      difficulty: file.difficulty,
      description: file.description,
      duration: file.duration,
      bpm: file.bpm,
      key: file.key,
      uploadedAt: new Date().toISOString()
    }));
    
    // Save configuration to file
    const configPath = path.join(process.cwd(), 'src', 'data', 'challenge-songs.json');
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(challengeConfig, null, 2));
    
    console.log(`\n📝 Challenge configuration saved to: ${configPath}`);
    console.log(`\n🎉 Upload complete! ${results.length} files uploaded to IPFS.`);
    
    return challengeConfig;
    
  } catch (error) {
    console.error('❌ Music upload failed:', error);
    throw error;
  }
}

// Export for use in other scripts
export default uploadMusicToIPFS;

// CLI usage
if (require.main === module) {
  uploadMusicToIPFS()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}