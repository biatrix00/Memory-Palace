import { GoogleGenerativeAI } from '@google/generative-ai';
import { Concept } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

export async function analyzeTextWithGemini(text: string): Promise<Concept[]> {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze the following text and break it down into meaningful concepts. For each concept, provide:
1. A name that summarizes the concept
2. The emotional tone (positive, negative, or neutral)
3. The intensity (0-1)
4. Relevant keywords

Text to analyze: "${text}"

Format the response as a JSON array of objects with the following structure:
[
  {
    "name": "concept name",
    "mood": "positive/negative/neutral",
    "intensity": 0.5,
    "keywords": ["keyword1", "keyword2"]
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    try {
      const concepts = JSON.parse(responseText) as Concept[];
      return concepts;
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return fallbackAnalysis(text);
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return fallbackAnalysis(text);
  }
}

function fallbackAnalysis(text: string): Concept[] {
  // Split text into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Simple word lists for mood detection
  const positiveWords = ['happy', 'joy', 'love', 'beautiful', 'wonderful', 'amazing', 'great', 'excellent', 'fantastic', 'brilliant', 'delightful', 'peaceful', 'calm', 'serene', 'warm', 'bright', 'sunny', 'cheerful', 'positive', 'good'];
  const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'horrible', 'bad', 'negative', 'dark', 'cold', 'scary', 'fear', 'anxiety', 'stress', 'pain', 'hurt', 'suffering', 'difficult', 'hard', 'trouble'];
  
  return sentences.map(sentence => {
    const words = sentence.toLowerCase().split(/\s+/);
    
    // Count word occurrences
    const wordCounts = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Determine mood
    const positiveCount = positiveWords.reduce((sum, word) => sum + (wordCounts[word] || 0), 0);
    const negativeCount = negativeWords.reduce((sum, word) => sum + (wordCounts[word] || 0), 0);
    
    let mood: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) {
      mood = 'positive';
    } else if (negativeCount > positiveCount) {
      mood = 'negative';
    }
    
    // Calculate intensity based on emotional words
    const emotionalWords = [...positiveWords, ...negativeWords];
    const emotionalCount = emotionalWords.reduce((sum, word) => sum + (wordCounts[word] || 0), 0);
    const intensity = Math.min(emotionalCount / 5, 1); // Cap at 1
    
    // Extract keywords (words that appear more than once or are emotional)
    const keywords = Object.entries(wordCounts)
      .filter(([word, count]) => count > 1 || emotionalWords.includes(word))
      .map(([word]) => word)
      .slice(0, 5); // Limit to 5 keywords
    
    return {
      name: sentence.trim().slice(0, 50), // Use first 50 chars as name
      mood,
      intensity,
      keywords
    };
  });
} 