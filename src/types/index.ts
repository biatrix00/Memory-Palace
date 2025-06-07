export type Mood = 'positive' | 'negative' | 'neutral';

export interface Concept {
  id: string;
  name: string;
  description: string;
  mood: Mood;
  intensity: number;
  keywords: string[];
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface RoomObject {
  type: 'cube' | 'sphere' | 'cylinder' | 'pyramid';
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: number;
}

export interface Room extends Concept {
  color: {
    r: number;
    g: number;
    b: number;
  };
  size: {
    width: number;
    height: number;
    depth: number;
  };
  lighting: {
    intensity: number;
    color: string;
  };
  objects: Array<{
    type: string;
    position: {
      x: number;
      y: number;
      z: number;
    };
    color: {
      r: number;
      g: number;
      b: number;
    };
  }>;
}

export interface AnalysisResult {
  concepts: Concept[];
  overallMood: Mood;
  summary: string;
}