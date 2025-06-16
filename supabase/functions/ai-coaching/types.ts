
export interface VocalData {
  pitchRange: {
    lowestNote: string;
    highestNote: string;
  };
  vibrato: {
    detected: boolean;
    rate: number;
    depth: number;
  };
  stability: {
    pitchConsistency: number;
    averageDeviation: number;
  };
  volume: {
    current: number;
    average: number;
  };
  formants: {
    vowelEstimate: string;
  };
  sessionStats: {
    duration: number;
    notesHit: string[];
    accuracyScore: number;
  };
}

export interface AIResponse {
  text: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface FeedbackCategories {
  technique: string;
  pitch: string;
  rhythm: string;
  breath: string;
}

export interface ParsedFeedback {
  text: string;
  categories: FeedbackCategories;
}
