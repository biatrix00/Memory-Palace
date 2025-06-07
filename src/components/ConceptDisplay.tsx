import React from 'react';
import { AnalysisResult } from '../types';

interface ConceptDisplayProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
}

export default function ConceptDisplay({ analysis, isLoading }: ConceptDisplayProps) {
  if (isLoading) {
    return (
      <div className="absolute bottom-6 left-6 w-80 z-10">
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/80 animate-pulse">🧠</span>
            <span className="text-sm text-white/80">Analyzing concepts...</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis || analysis.concepts.length === 0) return null;

  return (
    <div className="absolute bottom-6 left-6 w-80 z-10">
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-white/80">💡</span>
          <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            analysis.overallMood === 'positive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
            analysis.overallMood === 'negative' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}>
            {analysis.overallMood}
          </div>
        </div>
        
        <div className="space-y-4">
          {analysis.concepts.map((concept, index) => (
            <div key={index} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-medium text-white">{concept.name}</h4>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  concept.mood === 'positive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  concept.mood === 'negative' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {concept.mood}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/60">#</span>
                <span className="text-xs text-white/60">Keywords:</span>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {concept.keywords.map((keyword, keywordIndex) => (
                  <span
                    key={keywordIndex}
                    className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/80"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              
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
          ))}
        </div>
      </div>
    </div>
  );
}