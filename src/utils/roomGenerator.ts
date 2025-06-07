import { Room, Concept, RoomObject } from '../types';

export function generateRoom(concept: Concept): Room {
  const color = getMoodColor(concept.mood, concept.intensity);
  const objects = generateRoomObjects(concept);
  const size = getRoomSize(concept.mood, concept.intensity);
  const lighting = getRoomLighting(concept.mood, concept.intensity);

  return {
    id: concept.id,
    concept,
    color,
    objects,
    size,
    lighting
  };
}

function getRoomSize(mood: 'positive' | 'negative' | 'neutral', intensity: number): { width: number; height: number; depth: number } {
  const baseSize = 10;
  const sizeMultiplier = {
    positive: 1.5,
    negative: 0.7,
    neutral: 1.0
  }[mood];

  const adjustedSize = baseSize * sizeMultiplier * (0.8 + intensity * 0.4);
  
  return {
    width: adjustedSize,
    height: adjustedSize * 0.8,
    depth: adjustedSize
  };
}

function getRoomLighting(mood: 'positive' | 'negative' | 'neutral', intensity: number): { intensity: number; color: string } {
  const baseIntensity = {
    positive: 1.0,
    negative: 0.3,
    neutral: 0.7
  }[mood];

  const colors = {
    positive: '#ffffcc',
    negative: '#ffcccc',
    neutral: '#ccccff'
  }[mood];

  return {
    intensity: baseIntensity * (0.7 + intensity * 0.6),
    color: colors
  };
}

function getMoodColor(mood: 'positive' | 'negative' | 'neutral', intensity: number): { r: number; g: number; b: number } {
  const baseIntensity = Math.max(intensity, 0.3);
  
  switch (mood) {
    case 'positive':
      return { 
        r: 0.1 + baseIntensity * 0.2, 
        g: 0.4 + baseIntensity * 0.5, 
        b: 0.1 + baseIntensity * 0.3 
      };
    case 'negative':
      return { 
        r: 0.4 + baseIntensity * 0.5, 
        g: 0.1 + baseIntensity * 0.2, 
        b: 0.1 + baseIntensity * 0.2 
      };
    case 'neutral':
    default:
      return { 
        r: 0.2 + baseIntensity * 0.3, 
        g: 0.3 + baseIntensity * 0.3, 
        b: 0.4 + baseIntensity * 0.4 
      };
  }
}

function generateRoomObjects(concept: Concept): RoomObject[] {
  const objects: RoomObject[] = [];
  const objectCount = Math.min(Math.max(2, Math.floor(concept.intensity * 5)), 6);
  
  for (let i = 0; i < objectCount; i++) {
    const angle = (i / objectCount) * Math.PI * 2;
    const radius = 3 + Math.random() * 4;
    
    objects.push({
      type: getRandomObjectType(),
      position: {
        x: Math.cos(angle) * radius,
        y: 0.5 + Math.random() * 2,
        z: Math.sin(angle) * radius
      },
      scale: {
        x: 0.5 + Math.random() * 1.5,
        y: 0.5 + Math.random() * 1.5,
        z: 0.5 + Math.random() * 1.5
      },
      color: getObjectColor(concept.mood, concept.intensity)
    });
  }
  
  return objects;
}

function getRandomObjectType(): 'cube' | 'sphere' | 'cylinder' | 'pyramid' {
  const types: ('cube' | 'sphere' | 'cylinder' | 'pyramid')[] = ['cube', 'sphere', 'cylinder', 'pyramid'];
  return types[Math.floor(Math.random() * types.length)];
}

function getObjectColor(mood: 'positive' | 'negative' | 'neutral', intensity: number): number {
  const colors = {
    positive: [0x4ade80, 0x22c55e, 0x16a34a, 0x15803d],
    negative: [0xef4444, 0xdc2626, 0xb91c1c, 0x991b1b],
    neutral: [0x3b82f6, 0x2563eb, 0x1d4ed8, 0x1e40af]
  };
  
  const moodColors = colors[mood];
  const index = Math.floor(intensity * moodColors.length);
  return moodColors[Math.min(index, moodColors.length - 1)];
}