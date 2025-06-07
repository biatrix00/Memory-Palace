import React, { useState } from 'react';
import { Brain, Type, Sparkles, AlertCircle } from 'lucide-react';

interface TextInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  roomCount: number;
  hasApiKey: boolean;
}

export default function TextInput({ 
  text, 
  onTextChange, 
  onAnalyze, 
  isAnalyzing, 
  roomCount,
  hasApiKey 
}: TextInputProps) {
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(!hasApiKey);

  return (
    <div className="absolute top-6 left-6 w-96 z-10">
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-white/80" />
            <h2 className="text-lg font-semibold text-white">Memory Palace</h2>
          </div>
          {roomCount > 0 && (
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {roomCount} room{roomCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {!hasApiKey && showApiKeyWarning && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-200">
                <p className="font-medium mb-1">OpenAI API Key Required</p>
                <p>Add your OpenAI API key to environment variables as VITE_OPENAI_API_KEY for AI-powered analysis. Currently using fallback analysis.</p>
                <button 
                  onClick={() => setShowApiKeyWarning(false)}
                  className="mt-2 text-amber-300 hover:text-amber-100 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="relative mb-4">
          <Type className="absolute top-3 left-3 w-4 h-4 text-white/40" />
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Share your thoughts and watch concepts come to life as rooms..."
            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:border-white/30 transition-all duration-300"
          />
        </div>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || !text.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Brain className="w-4 h-4 animate-pulse" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Create Rooms
            </>
          )}
        </button>
        
        <div className="mt-4 text-xs text-white/60">
          Use WASD keys to navigate • Click rooms on map to teleport
        </div>
      </div>
    </div>
  );
}