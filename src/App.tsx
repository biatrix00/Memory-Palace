import React, { useState, useCallback } from 'react';
import ThreeScene from './components/ThreeScene';
import TextInput from './components/TextInput';
import MiniMap from './components/MiniMap';
import ConceptDisplay from './components/ConceptDisplay';
import { analyzeTextWithAI } from './services/openaiService';
import { generateRoom } from './utils/roomGenerator';
import { Room } from './types';

function App() {
  const [text, setText] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, z: 0 });
  const [teleportToRoom, setTeleportToRoom] = useState<string | null>(null);

  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;

  const handleAnalyze = useCallback(async () => {
    if (!text.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeTextWithAI(text);
      const newRooms = analysis.concepts.map(concept => generateRoom(concept));
      setRooms(newRooms);
      
      // Teleport to first room if available
      if (newRooms.length > 0) {
        setTeleportToRoom(newRooms[0].id);
        setTimeout(() => setTeleportToRoom(null), 100);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [text, isAnalyzing]);

  const handleRoomClick = useCallback((roomId: string) => {
    setTeleportToRoom(roomId);
    setTimeout(() => setTeleportToRoom(null), 100);
  }, []);

  const currentRoom = rooms.find(room => room.id === currentRoomId) || null;

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-900 relative">
      <ThreeScene 
        rooms={rooms}
        onRoomChange={setCurrentRoomId}
        onPlayerPositionChange={setPlayerPosition}
        teleportToRoom={teleportToRoom}
      />
      
      <TextInput 
        text={text} 
        onTextChange={setText}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        roomCount={rooms.length}
        hasApiKey={hasApiKey}
      />

      <MiniMap
        rooms={rooms}
        currentRoomId={currentRoomId}
        playerPosition={playerPosition}
        onRoomClick={handleRoomClick}
      />

      <ConceptDisplay
        currentRoom={currentRoom}
        analysisLoading={isAnalyzing}
      />
      
      {/* Instructions overlay */}
      <div className="absolute bottom-6 right-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white/80 text-sm max-w-xs">
        <h3 className="font-semibold mb-2">Navigation Controls</h3>
        <div className="space-y-1 text-xs">
          <div><kbd className="bg-white/10 px-1 rounded">W</kbd> Move forward</div>
          <div><kbd className="bg-white/10 px-1 rounded">S</kbd> Move backward</div>
          <div><kbd className="bg-white/10 px-1 rounded">A</kbd> Move left</div>
          <div><kbd className="bg-white/10 px-1 rounded">D</kbd> Move right</div>
          <div className="pt-1 border-t border-white/20">
            <div>Click rooms on map to teleport</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;