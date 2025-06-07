import OpenAI from 'openai';
import { AnalysisResult, Concept } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function analyzeTextWithAI(text: string): Promise<AnalysisResult> {
  if (!text.trim()) {
    return {
      concepts: [],
      overallMood: 'neutral',
      summary: 'No text to analyze'
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing text and extracting key concepts, themes, and emotional content. 
          
          Analyze the given text and extract 2-5 distinct concepts or themes. For each concept:
          - Give it a clear, concise name (1-3 words)
          - Provide a brief description
          - Determine its emotional mood (positive, negative, or neutral)
          - Rate its intensity from 0.1 to 1.0
          - List 2-4 relevant keywords
          
          Guidelines for concept extraction:
          1. Each concept should be distinct and meaningful
          2. Look for both explicit and implicit themes
          3. Consider emotional undertones and subtext
          4. Identify contrasting or complementary concepts
          5. Extract both concrete and abstract ideas
          
          Guidelines for mood analysis:
          - Positive: joy, love, excitement, pride, satisfaction
          - Negative: fear, anger, sadness, anxiety, stress
          - Neutral: observation, description, fact, balance
          
          Also provide an overall mood assessment and brief summary.
          
          Respond with valid JSON in this exact format:
          {
            "concepts": [
              {
                "name": "concept name",
                "description": "brief description",
                "mood": "positive|negative|neutral",
                "intensity": 0.7,
                "keywords": ["word1", "word2", "word3"]
              }
            ],
            "overallMood": "positive|negative|neutral",
            "summary": "brief overall summary"
          }`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    
    // Convert to our format and add IDs and positions
    const concepts: Concept[] = parsed.concepts.map((concept: any, index: number) => ({
      id: `concept-${index}`,
      name: concept.name,
      description: concept.description,
      mood: concept.mood,
      intensity: Math.max(0.1, Math.min(1.0, concept.intensity)),
      keywords: concept.keywords || [],
      position: calculateRoomPosition(index, parsed.concepts.length)
    }));

    return {
      concepts,
      overallMood: parsed.overallMood || 'neutral',
      summary: parsed.summary || 'Analysis complete'
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    return fallbackAnalysis(text);
  }
}

function calculateRoomPosition(index: number, total: number): { x: number; y: number; z: number } {
  if (total === 1) {
    return { x: 0, y: 0, z: 0 };
  }

  // Arrange rooms in a circle with increasing radius based on number of rooms
  const radius = Math.max(30, total * 10);
  const angle = (index / total) * Math.PI * 2;
  
  // Add some randomness to prevent perfect alignment
  const randomOffset = (Math.random() - 0.5) * 5;
  
  return {
    x: Math.cos(angle) * (radius + randomOffset),
    y: 0,
    z: Math.sin(angle) * (radius + randomOffset)
  };
}

function fallbackAnalysis(text: string): AnalysisResult {
  const words = text.toLowerCase().split(/\s+/);
  const concepts: Concept[] = [];
  
  // Simple fallback - create one concept based on text length and basic sentiment
  if (words.length > 0) {
    const positiveWords = ['good', 'great', 'happy', 'love', 'amazing', 'wonderful', 'excited', 'proud'];
    const negativeWords = ['bad', 'sad', 'hate', 'terrible', 'awful', 'horrible', 'nervous', 'stressed'];
    
    let mood: 'positive' | 'negative' | 'neutral' = 'neutral';
    const hasPositive = words.some(word => positiveWords.includes(word));
    const hasNegative = words.some(word => negativeWords.includes(word));
    
    if (hasPositive && !hasNegative) mood = 'positive';
    else if (hasNegative && !hasPositive) mood = 'negative';
    
    concepts.push({
      id: 'concept-0',
      name: 'Main Theme',
      description: 'Primary concept from your text',
      mood,
      intensity: Math.min(words.length / 20, 1.0),
      keywords: words.slice(0, 4),
      position: { x: 0, y: 0, z: 0 }
    });
  }
  
  return {
    concepts,
    overallMood: concepts[0]?.mood || 'neutral',
    summary: 'Fallback analysis used'
  };
}