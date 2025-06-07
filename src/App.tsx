import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import TextInput from './components/TextInput';
import Room from './components/Room';
import MiniMap from './components/MiniMap';
import ConceptDisplay from './components/ConceptDisplay';
import ErrorBoundary from './components/ErrorBoundary';
import { analyzeTextWithGemini, Concept } from './services/geminiService';
import { generateRoom } from './utils/roomGenerator';
import './App.css';

export default function App() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Array<{
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
  }>>([]);
  const [activeRoomIndex, setActiveRoomIndex] = useState<number | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);

  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const analyzedConcepts = await analyzeTextWithGemini(text);
      setConcepts(analyzedConcepts);

      const newRooms = analyzedConcepts.map(concept => generateRoom(concept));
      setRooms(newRooms);
      setActiveRoomIndex(0);
    } catch (err) {
      console.error('Error analyzing text:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the text');
    } finally {
      setIsAnalyzing(false);
    }
  }, [text]);

  return (
    <div className="app">
      <ErrorBoundary>
        <div className="canvas-container">
          <Canvas camera={{ position: [0, 5, 10], fov: 75 }}>
            <ambientLight intensity={0.5} />
            <OrbitControls />
            {rooms.map((room, index) => (
              <Room
                key={index}
                position={room.position}
                size={room.size}
                color={room.color}
                objects={room.objects}
                lighting={room.lighting}
                isActive={index === activeRoomIndex}
              />
            ))}
          </Canvas>
        </div>

        <div className="ui-container">
          <TextInput
            text={text}
            onTextChange={setText}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            roomCount={rooms.length}
            hasApiKey={hasApiKey}
          />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="bottom-ui">
            <MiniMap
              rooms={rooms}
              activeRoomIndex={activeRoomIndex}
              onRoomSelect={setActiveRoomIndex}
            />
            <ConceptDisplay
              concepts={concepts}
              activeRoomIndex={activeRoomIndex}
            />
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}