export interface Concept {
  name: string;
  mood: 'positive' | 'negative' | 'neutral';
  intensity: number;
  keywords: string[];
}

export interface AnalysisResult {
  concepts: Concept[];
  overallMood: 'positive' | 'negative' | 'neutral';
}

export interface RoomObject {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

export interface Room {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  objects: RoomObject[];
  lighting: {
    intensity: number;
    color: string;
  };
} 