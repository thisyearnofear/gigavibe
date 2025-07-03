import { VocalChallenge, UserVocalProfile } from '@/types';
import { AudioService } from '@/lib/audio/AudioService';

export class AIChallengeGenerator {
  private noteFrequencies: Record<string, number> = {
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
    'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
    'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
    'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
    'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25,
    'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00,
    'A#5': 932.33, 'B5': 987.77,
  };

  private scales = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    pentatonic: [0, 2, 4, 7, 9],
    blues: [0, 3, 5, 6, 7, 10],
  };

  private intervals = {
    unison: 0,
    minor2nd: 1,
    major2nd: 2,
    minor3rd: 3,
    major3rd: 4,
    perfect4th: 5,
    tritone: 6,
    perfect5th: 7,
    minor6th: 8,
    major6th: 9,
    minor7th: 10,
    major7th: 11,
    octave: 12,
  };

  generateDailyChallenge(userProfile?: UserVocalProfile): VocalChallenge {
    const challengeTypes = ['scale', 'interval', 'rhythm', 'range'];
    const randomType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)] as VocalChallenge['type'];
    
    switch (randomType) {
      case 'scale':
        return this.generateScaleChallenge(userProfile);
      case 'interval':
        return this.generateIntervalChallenge(userProfile);
      case 'rhythm':
        return this.generateRhythmChallenge(userProfile);
      case 'range':
        return this.generateRangeChallenge(userProfile);
      default:
        return this.generateScaleChallenge(userProfile);
    }
  }

  generateScaleChallenge(userProfile?: UserVocalProfile): VocalChallenge {
    const scaleTypes = Object.keys(this.scales);
    const randomScale = scaleTypes[Math.floor(Math.random() * scaleTypes.length)] as keyof typeof this.scales;
    const scale = this.scales[randomScale];
    
    // Choose root note based on user's range or default to C4
    const rootNote = userProfile ? this.getOptimalRootNote(userProfile) : 'C4';
    const rootFreq = this.noteFrequencies[rootNote];
    
    // Generate scale notes
    const notes: string[] = [];
    const frequencies: number[] = [];
    
    scale.forEach(semitone => {
      const freq = rootFreq * Math.pow(2, semitone / 12);
      const noteName = this.frequencyToNoteName(freq);
      notes.push(noteName);
      frequencies.push(freq);
    });

    // Add octave
    const octaveFreq = rootFreq * 2;
    notes.push(this.frequencyToNoteName(octaveFreq));
    frequencies.push(octaveFreq);

    const difficulty = userProfile?.preferredDifficulty || 'beginner';
    const timing = this.generateTiming(notes.length, difficulty);
    
    return {
      id: `scale_${randomScale}_${Date.now()}`,
      title: `${randomScale.charAt(0).toUpperCase() + randomScale.slice(1)} Scale Challenge`,
      description: `Sing the ${randomScale} scale starting from ${rootNote}. Hit each note accurately and in time!`,
      difficulty,
      type: 'scale',
      notes,
      targetFrequencies: frequencies,
      timing,
      tolerance: this.getToleranceForDifficulty(difficulty),
      estimatedDuration: timing.reduce((sum, time) => sum + time, 0),
      socialPrompt: `Just crushed a ${randomScale} scale challenge on GIGAVIBE! 🎵 Who's ready to battle? 🔥`,
      createdBy: 'ai' as const,
      tags: ['scale', randomScale, difficulty],
      createdAt: Date.now(),
    };
  }

  generateIntervalChallenge(userProfile?: UserVocalProfile): VocalChallenge {
    const intervalNames = Object.keys(this.intervals);
    const randomInterval = intervalNames[Math.floor(Math.random() * intervalNames.length)] as keyof typeof this.intervals;
    const semitones = this.intervals[randomInterval];
    
    const rootNote = userProfile ? this.getOptimalRootNote(userProfile) : 'C4';
    const rootFreq = this.noteFrequencies[rootNote];
    const intervalFreq = rootFreq * Math.pow(2, semitones / 12);
    
    const notes = [rootNote, this.frequencyToNoteName(intervalFreq)];
    const frequencies = [rootFreq, intervalFreq];
    
    const difficulty = userProfile?.preferredDifficulty || 'beginner';
    const timing = [2000, 2000]; // 2 seconds each note
    
    return {
      id: `interval_${randomInterval}_${Date.now()}`,
      title: `${randomInterval.replace(/([A-Z])/g, ' $1').trim()} Interval`,
      description: `Sing a perfect ${randomInterval} interval. Start with ${rootNote}, then hit the target note!`,
      difficulty,
      type: 'interval',
      notes,
      targetFrequencies: frequencies,
      timing,
      tolerance: this.getToleranceForDifficulty(difficulty),
      estimatedDuration: 4000,
      socialPrompt: `Nailed a ${randomInterval} interval challenge! 🎯 Perfect pitch training on GIGAVIBE 🚀`,
      createdBy: 'ai',
      tags: ['interval', randomInterval, difficulty],
      createdAt: Date.now(),
    };
  }

  generateRhythmChallenge(userProfile?: UserVocalProfile): VocalChallenge {
    const note = userProfile ? this.getOptimalRootNote(userProfile) : 'A4';
    const frequency = this.noteFrequencies[note];
    
    // Create rhythm pattern: long, short, short, long
    const rhythmPattern = [1500, 500, 500, 1500]; // milliseconds
    const notes = Array(4).fill(note);
    const frequencies = Array(4).fill(frequency);
    
    const difficulty = userProfile?.preferredDifficulty || 'beginner';
    
    return {
      id: `rhythm_${Date.now()}`,
      title: 'Rhythm Master Challenge',
      description: `Hold the note ${note} following the rhythm pattern: LONG-short-short-LONG`,
      difficulty,
      type: 'rhythm',
      notes,
      targetFrequencies: frequencies,
      timing: rhythmPattern,
      tolerance: this.getToleranceForDifficulty(difficulty),
      estimatedDuration: rhythmPattern.reduce((sum, time) => sum + time, 0),
      socialPrompt: `Just mastered a rhythm challenge on GIGAVIBE! 🥁 Timing is everything! ⏰`,
      createdBy: 'ai',
      tags: ['rhythm', 'timing', difficulty],
      createdAt: Date.now(),
    };
  }

  generateRangeChallenge(userProfile?: UserVocalProfile): VocalChallenge {
    // Challenge user to expand their range
    const baseNote = userProfile ? this.getOptimalRootNote(userProfile) : 'C4';
    const baseFreq = this.noteFrequencies[baseNote];
    
    // Go up and down from base note
    const notes: string[] = [];
    const frequencies: number[] = [];
    
    // Down a 3rd, base, up a 3rd, up a 5th
    const intervals = [-3, 0, 3, 7];
    
    intervals.forEach(semitone => {
      const freq = baseFreq * Math.pow(2, semitone / 12);
      notes.push(this.frequencyToNoteName(freq));
      frequencies.push(freq);
    });
    
    const difficulty = userProfile?.preferredDifficulty || 'beginner';
    const timing = Array(4).fill(2000); // 2 seconds each
    
    return {
      id: `range_${Date.now()}`,
      title: 'Vocal Range Explorer',
      description: `Explore your vocal range! Sing low to high: ${notes.join(' → ')}`,
      difficulty,
      type: 'range',
      notes,
      targetFrequencies: frequencies,
      timing,
      tolerance: this.getToleranceForDifficulty(difficulty),
      estimatedDuration: 8000,
      socialPrompt: `Expanding my vocal range on GIGAVIBE! 📈 From ${notes[0]} to ${notes[notes.length - 1]} 🎵`,
      createdBy: 'ai',
      tags: ['range', 'exploration', difficulty],
      createdAt: Date.now(),
    };
  }

  private getOptimalRootNote(userProfile: UserVocalProfile): string {
    // Simple logic to pick a note in user's comfortable range
    const availableNotes = Object.keys(this.noteFrequencies);
    const midRangeNotes = availableNotes.filter(note => 
      note.includes('4') || note.includes('3')
    );
    return midRangeNotes[Math.floor(Math.random() * midRangeNotes.length)];
  }

  private frequencyToNoteName(frequency: number): string {
    // Find closest note name to frequency
    let closestNote = 'A4';
    let minDiff = Infinity;
    
    Object.entries(this.noteFrequencies).forEach(([note, freq]) => {
      const diff = Math.abs(freq - frequency);
      if (diff < minDiff) {
        minDiff = diff;
        closestNote = note;
      }
    });
    
    return closestNote;
  }

  private generateTiming(noteCount: number, difficulty: string): number[] {
    const baseTiming = difficulty === 'beginner' ? 2000 : 
                     difficulty === 'intermediate' ? 1500 : 1000;
    
    return Array(noteCount).fill(baseTiming);
  }

  private getToleranceForDifficulty(difficulty: string): number {
    switch (difficulty) {
      case 'beginner': return 50; // 50 cents tolerance
      case 'intermediate': return 30;
      case 'advanced': return 15;
      default: return 50;
    }
  }
}
