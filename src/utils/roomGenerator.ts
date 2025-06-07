import { Concept } from '../types';

interface Room {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  objects: Array<{
    position: [number, number, number];
    size: [number, number, number];
    color: string;
  }>;
  lighting: {
    intensity: number;
    color: string;
  };
}

export function generateRoom(concept: Concept): Room {
  const color = getMoodColor(concept.mood);
  const size = calculateRoomSize(concept);
  const lighting = getLighting(concept);
  const objects = generateRoomObjects(concept);

  return {
    position: [0, 0, 0],
    size: [size.width, size.height, size.depth],
    color,
    objects,
    lighting
  };
}

function calculateRoomSize(concept: Concept) {
  // Base size
  const baseSize = 2;
  
  // Adjust size based on concept intensity and number of keywords
  const intensityMultiplier = 1 + concept.intensity;
  const keywordMultiplier = 1 + (concept.keywords.length * 0.1);
  
  const size = baseSize * intensityMultiplier * keywordMultiplier;
  
  return {
    width: size,
    height: size * 1.5, // Taller rooms for better visibility
    depth: size
  };
}

function getMoodColor(mood: 'positive' | 'negative' | 'neutral'): string {
  switch (mood) {
    case 'positive':
      return '#4ade80'; // Green
    case 'negative':
      return '#f87171'; // Red
    default:
      return '#94a3b8'; // Gray
  }
}

function getLighting(concept: Concept) {
  const baseIntensity = 0.5;
  const moodIntensity = {
    positive: 1.2,
    negative: 0.8,
    neutral: 1.0
  }[concept.mood];

  return {
    intensity: baseIntensity * moodIntensity * (1 + concept.intensity * 0.5),
    color: getMoodLightColor(concept.mood)
  };
}

function getMoodLightColor(mood: 'positive' | 'negative' | 'neutral'): string {
  switch (mood) {
    case 'positive':
      return '#90EE90'; // Light green
    case 'negative':
      return '#FFB6C1'; // Light red
    default:
      return '#FFFFFF'; // White
  }
}

function generateRoomObjects(concept: Concept): Array<{
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}> {
  const objects: Array<{
    position: [number, number, number];
    size: [number, number, number];
    color: string;
  }> = [];
  
  // Determine object count based on concept properties
  const objectCount = Math.floor(
    2 + // Base objects
    concept.intensity * 3 + // More objects for higher intensity
    concept.keywords.length * 0.5 // Additional objects based on keywords
  );

  // Create a central focal point object
  objects.push({
    position: [0, 1.5, 0],
    size: [1, 1, 1],
    color: getObjectColor(concept.mood, concept.intensity)
  });

  // Create surrounding objects in a structured pattern
  const radius = 6;
  for (let i = 0; i < objectCount - 1; i++) {
    const angle = (i / (objectCount - 1)) * Math.PI * 2;
    
    // Calculate position with variation
    const x = Math.cos(angle) * radius * (0.9 + Math.random() * 0.2);
    const z = Math.sin(angle) * radius * (0.9 + Math.random() * 0.2);
    
    // Height varies based on mood and intensity
    const heightMultiplier = concept.mood === 'positive' ? 1.2 : concept.mood === 'negative' ? 0.8 : 1.0;
    const y = 0.5 + Math.random() * 1.5 * heightMultiplier * (1 + concept.intensity * 0.5);
    
    objects.push({
      position: [x, y, z],
      size: [0.5, 0.5, 0.5],
      color: getObjectColor(concept.mood, concept.intensity)
    });
  }
  
  return objects;
}

function getObjectColor(mood: 'positive' | 'negative' | 'neutral', intensity: number): string {
  const colors = {
    positive: [
      '#4ade80', // Green
      '#22c55e', // Darker green
      '#16a34a', // Even darker green
      '#15803d', // Very dark green
      '#86efac'  // Light green
    ],
    negative: [
      '#f87171', // Red
      '#ef4444', // Darker red
      '#dc2626', // Even darker red
      '#b91c1c', // Very dark red
      '#fca5a5'  // Light red
    ],
    neutral: [
      '#60a5fa', // Blue
      '#3b82f6', // Darker blue
      '#2563eb', // Even darker blue
      '#1d4ed8', // Very dark blue
      '#93c5fd'  // Light blue
    ]
  };
  
  const moodColors = colors[mood];
  const index = Math.floor(intensity * moodColors.length);
  return moodColors[Math.min(index, moodColors.length - 1)];
}