export interface Concept {
  id: string;
  name: string;
  description: string;
  mood: 'positive' | 'negative' | 'neutral';
  intensity: number;
  keywords: string[];
  position: { x: number; y: number; z: number };
}

export interface RoomObject {
  type: 'cube' | 'sphere' | 'cylinder' | 'pyramid';
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: number;
}

export interface Room {
  id: string;
  concept: Concept;
  color: { r: number; g: number; b: number };
  objects: RoomObject[];
  size: { width: number; height: number; depth: number };
  lighting: { intensity: number; color: string };
}

export interface AnalysisResult {
  concepts: Concept[];
  overallMood: 'positive' | 'negative' | 'neutral';
  summary: string;
}