
import { VocalData } from './types.ts';

export function generateCoachingPrompt(vocalData: VocalData, skillLevel: string): string {
  const { pitchRange, vibrato, stability, volume, formants, sessionStats } = vocalData;
  
  return `Analyze this vocal performance data and provide coaching advice:

PERFORMANCE DATA:
- Pitch Range: ${pitchRange.lowestNote} to ${pitchRange.highestNote}
- Pitch Stability: ${Math.round(stability.pitchConsistency)}%
- Average Deviation: ${Math.round(stability.averageDeviation)} cents
- Volume Control: Current ${Math.round(volume.current)}%, Average ${Math.round(volume.average)}%
- Vibrato: ${vibrato.detected ? `Detected (${vibrato.rate.toFixed(1)}Hz, ${vibrato.depth.toFixed(1)} cents)` : 'Not detected'}
- Vowel Sound: ${formants.vowelEstimate}
- Session Duration: ${Math.round(sessionStats.duration)}s
- Notes Hit: ${sessionStats.notesHit.join(', ')}
- Overall Score: ${Math.round(sessionStats.accuracyScore)}/100

SKILL LEVEL: ${skillLevel}

Provide feedback in this format:
[TECHNIQUE] - Technical advice about breath, posture, or vocal technique
[PITCH] - Specific pitch accuracy feedback
[RHYTHM] - Timing and flow observations
[BREATH] - Breathing and support suggestions

Limit feedback to 2-3 sentences per category. Focus on the most important improvement areas.`;
}

export function parseFeedback(text: string) {
  const categories = {
    technique: '',
    pitch: '',
    rhythm: '',
    breath: ''
  };

  const techniqueMatch = text.match(/\[TECHNIQUE\](.*?)(?=\[|$)/s);
  const pitchMatch = text.match(/\[PITCH\](.*?)(?=\[|$)/s);
  const rhythmMatch = text.match(/\[RHYTHM\](.*?)(?=\[|$)/s);
  const breathMatch = text.match(/\[BREATH\](.*?)(?=\[|$)/s);

  if (techniqueMatch) categories.technique = techniqueMatch[1].trim();
  if (pitchMatch) categories.pitch = pitchMatch[1].trim();
  if (rhythmMatch) categories.rhythm = rhythmMatch[1].trim();
  if (breathMatch) categories.breath = breathMatch[1].trim();

  return {
    text,
    categories
  };
}
