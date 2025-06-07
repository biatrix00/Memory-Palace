import OpenAI from 'openai';
import { AnalysisResult, Concept, Mood } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function analyzeTextWithAI(text: string): Promise<AnalysisResult> {
  console.log('Analyzing text:', text);
  
  if (!text.trim()) {
    console.log('Empty text, returning empty result');
    return {
      concepts: [],
      overallMood: 'neutral',
      summary: 'No text to analyze'
    };
  }

  try {
    console.log('Making OpenAI API call...');
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
          
          Example analysis for "I love my job but hate commuting and miss my family":
          {
            "concepts": [
              {
                "name": "Job Satisfaction",
                "description": "Positive feelings about work",
                "mood": "positive",
                "intensity": 0.8,
                "keywords": ["love", "job", "satisfaction"]
              },
              {
                "name": "Commute Frustration",
                "description": "Negative feelings about travel to work",
                "mood": "negative",
                "intensity": 0.7,
                "keywords": ["hate", "commuting", "frustration"]
              },
              {
                "name": "Family Longing",
                "description": "Missing family connections",
                "mood": "negative",
                "intensity": 0.6,
                "keywords": ["miss", "family", "longing"]
              }
            ],
            "overallMood": "neutral",
            "summary": "Mixed emotions about work-life balance"
          }
          
          Respond with valid JSON in this exact format.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    console.log('Raw OpenAI response:', response.choices[0]?.message?.content);

    if (!response.choices[0]?.message?.content) {
      console.error('Empty response from OpenAI API');
      throw new Error('Empty response from OpenAI API');
    }

    try {
      const analysis = JSON.parse(response.choices[0].message.content);
      console.log('Parsed analysis:', analysis);

      if (!analysis.concepts || !Array.isArray(analysis.concepts) || analysis.concepts.length === 0) {
        console.error('Invalid analysis format - no concepts array');
        throw new Error('Invalid analysis format');
      }

      // Validate and process each concept
      const processedConcepts = analysis.concepts.map((concept: any, index: number) => {
        if (!concept.name || !concept.description) {
          console.error(`Invalid concept at index ${index}:`, concept);
          throw new Error(`Invalid concept at index ${index}`);
        }

        return {
          id: `concept-${index}`,
          name: concept.name,
          description: concept.description,
          mood: (concept.mood || 'neutral') as Mood,
          intensity: Math.max(0.1, Math.min(1, concept.intensity || 0.5)),
          keywords: Array.isArray(concept.keywords) ? concept.keywords : [],
          position: calculateRoomPosition(index, analysis.concepts.length)
        };
      });

      console.log('Processed concepts:', processedConcepts);
      
      return {
        concepts: processedConcepts,
        overallMood: (analysis.overallMood || 'neutral') as Mood,
        summary: analysis.summary || 'Analysis complete'
      };

    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse OpenAI response');
    }

  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // Handle specific error cases
    if (error.status === 429 || error.message?.includes('quota')) {
      console.warn('API quota exceeded - using enhanced fallback analysis');
      return enhancedFallbackAnalysis(text);
    }

    // For other errors, try the fallback
    console.warn('Using enhanced fallback analysis due to error:', error.message);
    return enhancedFallbackAnalysis(text);
  }
}

function calculateRoomPosition(index: number, total: number): { x: number; y: number; z: number } {
  if (total === 1) {
    return { x: 0, y: 0, z: 0 };
  }

  // Arrange rooms in a circle with increasing radius based on number of rooms
  const radius = Math.max(40, total * 15); // Increased spacing between rooms
  const angle = (index / total) * Math.PI * 2;
  
  // Add some randomness to prevent perfect alignment
  const randomOffset = (Math.random() - 0.5) * 3;
  
  return {
    x: Math.cos(angle) * (radius + randomOffset),
    y: 0,
    z: Math.sin(angle) * (radius + randomOffset)
  };
}

function enhancedFallbackAnalysis(text: string): AnalysisResult {
  console.log('Using enhanced fallback analysis for:', text);
  
  // Split text into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  console.log('Split into sentences:', sentences);
  
  // Extract concepts from each sentence
  const concepts: Concept[] = [];
  let overallMood: Mood = 'neutral';
  let positiveCount = 0;
  let negativeCount = 0;
  
  sentences.forEach((sentence, index) => {
    const words = sentence.toLowerCase().split(/\s+/);
    
    // Look for emotional indicators
    const positiveWords = ['love', 'happy', 'joy', 'excited', 'great', 'wonderful', 'amazing'];
    const negativeWords = ['hate', 'sad', 'angry', 'terrible', 'awful', 'bad', 'miss'];
    
    let mood: Mood = 'neutral';
    let intensity = 0.5;
    
    // Check for positive/negative words
    const hasPositive = positiveWords.some(word => words.includes(word));
    const hasNegative = negativeWords.some(word => words.includes(word));
    
    if (hasPositive && !hasNegative) {
      mood = 'positive';
      intensity = 0.8;
      positiveCount++;
    } else if (hasNegative && !hasPositive) {
      mood = 'negative';
      intensity = 0.8;
      negativeCount++;
    } else if (hasPositive && hasNegative) {
      mood = 'neutral';
      intensity = 0.6;
    }
    
    // Extract key phrases (2-3 word combinations)
    const keyPhrases: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = words.slice(i, i + 2).join(' ');
      if (phrase.length > 3) {
        keyPhrases.push(phrase);
      }
    }
    
    // Create concept from the sentence
    concepts.push({
      id: `concept-${index}`,
      name: sentence.trim().slice(0, 30),
      description: sentence.trim(),
      mood,
      intensity,
      keywords: keyPhrases.slice(0, 3),
      position: calculateRoomPosition(index, sentences.length)
    });
  });
  
  // Determine overall mood based on concept counts
  if (positiveCount > negativeCount) {
    overallMood = 'positive';
  } else if (negativeCount > positiveCount) {
    overallMood = 'negative';
  }
  
  console.log('Fallback concepts:', concepts);
  
  return {
    concepts,
    overallMood,
    summary: `Analyzed ${concepts.length} concepts with ${overallMood} overall mood`
  };
}