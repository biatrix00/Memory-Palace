export type MoodType = 'positive' | 'negative' | 'neutral';

interface MoodResult {
  mood: MoodType;
  intensity: number;
}

const positiveWords = [
  'happy', 'joy', 'love', 'excited', 'amazing', 'wonderful', 'great', 'excellent',
  'fantastic', 'beautiful', 'perfect', 'awesome', 'brilliant', 'outstanding',
  'successful', 'achievement', 'victory', 'triumph', 'blessed', 'grateful',
  'peaceful', 'serene', 'confident', 'optimistic', 'hopeful', 'inspired',
  'motivated', 'energetic', 'thrilled', 'delighted', 'pleasant', 'cheerful'
];

const negativeWords = [
  'sad', 'angry', 'hate', 'terrible', 'awful', 'horrible', 'bad', 'worst',
  'frustrated', 'disappointed', 'depressed', 'anxious', 'worried', 'stressed',
  'upset', 'annoyed', 'furious', 'devastated', 'heartbroken', 'lonely',
  'hopeless', 'defeated', 'failure', 'mistake', 'regret', 'pain', 'hurt',
  'difficult', 'challenging', 'overwhelming', 'exhausted', 'tired'
];

export function analyzeMood(text: string): MoodResult {
  if (!text.trim()) {
    return { mood: 'neutral', intensity: 0.3 };
  }

  const words = text.toLowerCase().split(/\s+/);
  let positiveScore = 0;
  let negativeScore = 0;

  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    
    if (positiveWords.some(pw => cleanWord.includes(pw) || pw.includes(cleanWord))) {
      positiveScore++;
    }
    if (negativeWords.some(nw => cleanWord.includes(nw) || nw.includes(cleanWord))) {
      negativeScore++;
    }
  });

  const totalScore = positiveScore + negativeScore;
  const netScore = positiveScore - negativeScore;

  if (totalScore === 0) {
    return { mood: 'neutral', intensity: 0.3 };
  }

  const intensity = Math.min(Math.max(totalScore / words.length * 2, 0.2), 1.0);

  if (netScore > 0) {
    return { mood: 'positive', intensity };
  } else if (netScore < 0) {
    return { mood: 'negative', intensity };
  } else {
    return { mood: 'neutral', intensity };
  }
}

export function getMoodColor(mood: MoodType): { r: number; g: number; b: number } {
  switch (mood) {
    case 'positive':
      return { r: 0.2, g: 0.8, b: 0.3 }; // Emerald green
    case 'negative':
      return { r: 0.9, g: 0.2, b: 0.2 }; // Crimson red
    case 'neutral':
    default:
      return { r: 0.3, g: 0.5, b: 0.9 }; // Sapphire blue
  }
}