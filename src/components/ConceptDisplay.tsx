import React from 'react';
import { Room } from '../types';
import { Brain, Lightbulb, Hash } from 'lucide-react';

interface ConceptDisplayProps {
  currentRoom: Room | null;
  analysisLoading: boolean;
}

export default function ConceptDisplay({ currentRoom, analysisLoading }: ConceptDisplayProps) {
  if (analysisLoading) {
    return (
      <div className="absolute bottom-6 left-6 w-80 z-10">
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-white/80 animate-pulse" />
            <span className="text-sm text-white/80">Analyzing concepts...</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRoom) return null;

  const { concept } = currentRoom;

  return (
    <div className="absolute bottom-6 left-6 w-80 z-10">
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-white/80" />
          <h3 className="text-lg font-semibold text-white">{concept.name}</h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            concept.mood === 'positive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
            concept.mood === 'negative' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}>
            {concept.mood}
          </div>
        </div>
        
        <p className="text-sm text-white/70 mb-3">{concept.description}</p>
        
        <div className="flex items-center gap-2 mb-2">
          <Hash className="w-3 h-3 text-white/60" />
          <span className="text-xs text-white/60">Keywords:</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {concept.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/80"
            >
              {keyword}
            </span>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center text-xs text-white/60">
            <span>Intensity</span>
            <span>{Math.round(concept.intensity * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 mt-1">
            <div 
              className="bg-white/60 h-1 rounded-full transition-all duration-300"
              style={{ width: `${concept.intensity * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}