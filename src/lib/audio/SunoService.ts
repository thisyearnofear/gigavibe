'use client';

import axios from 'axios';

export interface SunoGenerateRequest {
  prompt: string;
  style?: string;
  title?: string;
  customMode: boolean;
  instrumental: boolean;
  model: 'V3_5' | 'V4' | 'V4_5';
  negativeTags?: string;
  callBackUrl: string;
}

export interface SunoTrack {
  id: string;
  audio_url: string;
  source_audio_url: string;
  stream_audio_url: string;
  source_stream_audio_url: string;
  image_url: string;
  source_image_url: string;
  prompt: string;
  model_name: string;
  title: string;
  tags: string;
  createTime: string;
  duration: number;
}

export interface SunoGenerateResponse {
  code: number;
  msg: string;
  data: {
    task_id: string;
    tracks?: SunoTrack[];
  };
}

export interface SunoTaskStatus {
  code: number;
  msg: string;
  data: {
    taskId: string;
    status: 'PENDING' | 'TEXT_SUCCESS' | 'FIRST_SUCCESS' | 'SUCCESS' | 'CREATE_TASK_FAILED' | 'GENERATE_AUDIO_FAILED';
    response?: {
      data?: SunoTrack[];
    };
  };
}

export interface VocalRemovalResponse {
  code: number;
  msg: string;
  data: {
    task_id: string;
    vocal_removal_info?: {
      instrumental_url: string;
      origin_url: string;
      vocal_url: string;
    };
  };
}

export interface ViralChallenge {
  id: string;
  title: string;
  originalAudio: string; // Full track with vocals
  instrumentalAudio: string; // Backing track only
  vocalsOnlyAudio: string; // Isolated vocals for comparison
  duration: number;
  prompt: string;
  tags: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export class SunoService {
  private static readonly BASE_URL = 'https://api.sunoapi.org/api/v1';
  private static readonly API_KEY = process.env.NEXT_PUBLIC_SUNO_API_KEY;

  private static getHeaders() {
    if (!this.API_KEY) {
      throw new Error('Suno API key not configured');
    }
    
    return {
      'Authorization': `Bearer ${this.API_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Generate a viral challenge with AI music
   */
  static async generateViralChallenge(
    prompt: string,
    difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'
  ): Promise<ViralChallenge> {
    try {
      // Step 1: Generate music with vocals
      const generateResponse = await this.generateMusic({
        prompt,
        customMode: false, // Let Suno create lyrics
        instrumental: false, // We want vocals
        model: 'V4_5', // Best quality
        callBackUrl: `${window.location.origin}/api/suno/callback`
      });

      if (generateResponse.code !== 200) {
        throw new Error(`Music generation failed: ${generateResponse.msg}`);
      }

      // Step 2: Poll for completion
      const taskId = generateResponse.data.task_id;
      const completedTask = await this.waitForCompletion(taskId);
      
      if (!completedTask.data.response?.data?.[0]) {
        throw new Error('No tracks generated');
      }

      const track = completedTask.data.response.data[0];

      // Step 3: Separate vocals
      const vocalRemoval = await this.separateVocals(taskId, track.id);
      
      if (vocalRemoval.code !== 200) {
        throw new Error(`Vocal separation failed: ${vocalRemoval.msg}`);
      }

      // Step 4: Wait for vocal separation to complete
      const separationResult = await this.waitForVocalSeparation(vocalRemoval.data.task_id);

      return {
        id: track.id,
        title: track.title,
        originalAudio: track.audio_url,
        instrumentalAudio: separationResult.instrumental_url,
        vocalsOnlyAudio: separationResult.vocal_url,
        duration: track.duration,
        prompt: track.prompt,
        tags: track.tags,
        difficulty
      };
    } catch (error) {
      console.error('Failed to generate viral challenge:', error);
      throw error;
    }
  }

  /**
   * Generate music with Suno API
   */
  static async generateMusic(request: SunoGenerateRequest): Promise<SunoGenerateResponse> {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/generate`,
        request,
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Suno music generation failed:', error);
      throw error;
    }
  }

  /**
   * Get task status and details
   */
  static async getTaskStatus(taskId: string): Promise<SunoTaskStatus> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/generate/record-info`,
        {
          params: { taskId },
          headers: this.getHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Failed to get task status:', error);
      throw error;
    }
  }

  /**
   * Separate vocals from music
   */
  static async separateVocals(taskId: string, audioId: string): Promise<VocalRemovalResponse> {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/vocal-removal/generate`,
        {
          taskId,
          audioId,
          callBackUrl: `${window.location.origin}/api/suno/vocal-callback`
        },
        { headers: this.getHeaders() }
      );
      
      return response.data;
    } catch (error) {
      console.error('Vocal separation failed:', error);
      throw error;
    }
  }

  /**
   * Wait for task completion with polling
   */
  private static async waitForCompletion(taskId: string, maxAttempts = 30): Promise<SunoTaskStatus> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getTaskStatus(taskId);
      
      if (status.data.status === 'SUCCESS') {
        return status;
      }
      
      if (status.data.status.includes('FAILED') || status.data.status.includes('ERROR')) {
        throw new Error(`Task failed with status: ${status.data.status}`);
      }
      
      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error('Task completion timeout');
  }

  /**
   * Wait for vocal separation completion
   */
  private static async waitForVocalSeparation(taskId: string, maxAttempts = 30): Promise<{
    instrumental_url: string;
    vocal_url: string;
    origin_url: string;
  }> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(
          `${this.BASE_URL}/vocal-removal/record-info`,
          {
            params: { taskId },
            headers: this.getHeaders()
          }
        );
        
        const result = response.data;
        
        if (result.code !== 200) {
          throw new Error(`API error: ${result.msg}`);
        }
        
        // Check if vocal separation is complete
        if (result.data.status === 'SUCCESS' && result.data.vocal_removal_info) {
          return {
            instrumental_url: result.data.vocal_removal_info.instrumental_url,
            vocal_url: result.data.vocal_removal_info.vocal_url,
            origin_url: result.data.vocal_removal_info.origin_url
          };
        }
        
        if (result.data.status.includes('FAILED') || result.data.status.includes('ERROR')) {
          throw new Error(`Vocal separation failed with status: ${result.data.status}`);
        }
        
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        // Only throw on last attempt, otherwise keep trying
        if (attempt === maxAttempts - 1) {
          console.error('Vocal separation polling failed:', error);
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    throw new Error('Vocal separation timeout');
  }

  /**
   * Get featured challenges from the API
   */
  static async getFeaturedChallenges(): Promise<ViralChallenge[]> {
    try {
      const response = await axios.get('/api/challenges/featured');
      return response.data.challenges;
    } catch (error) {
      console.error('Failed to fetch featured challenges:', error);
      throw error;
    }
  }
}