import React from 'react';
import { Room } from '../types';

interface MiniMapProps {
  rooms: Room[];
  currentRoomIndex: number;
  onRoomClick: (index: number) => void;
}

export default function MiniMap({ rooms, currentRoomIndex, onRoomClick }: MiniMapProps) {
  if (rooms.length === 0) return null;

  const mapSize = 200;
  const scale = 0.8;

  return (
    <div className="absolute top-6 right-6 w-64 z-10">
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-white/80">🗺️</span>
          <h3 className="text-sm font-semibold text-white">Room Map</h3>
        </div>
        
        <div className="relative bg-black/20 rounded-lg p-4" style={{ width: mapSize, height: mapSize }}>
          {/* Center point */}
          <div 
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            style={{
              left: mapSize / 2 - 2,
              top: mapSize / 2 - 2
            }}
          />
          
          {/* Rooms */}
          {rooms.map((room, index) => {
            const x = (room.position.x * scale) + mapSize / 2;
            const z = (room.position.z * scale) + mapSize / 2;
            const isActive = index === currentRoomIndex;
            
            return (
              <button
                key={index}
                onClick={() => onRoomClick(index)}
                className={`absolute w-4 h-4 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                  isActive 
                    ? 'border-white bg-white/30 shadow-lg' 
                    : 'border-white/60 bg-white/10 hover:bg-white/20'
                }`}
                style={{
                  left: Math.max(0, Math.min(mapSize - 16, x - 8)),
                  top: Math.max(0, Math.min(mapSize - 16, z - 8)),
                  backgroundColor: isActive 
                    ? `rgb(${room.color.r * 255}, ${room.color.g * 255}, ${room.color.b * 255})` 
                    : undefined
                }}
                title={`Room ${index + 1}`}
              />
            );
          })}
        </div>
        
        {/* Room list */}
        <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
          {rooms.map((room, index) => (
            <button
              key={index}
              onClick={() => onRoomClick(index)}
              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                index === currentRoomIndex
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: `rgb(${room.color.r * 255}, ${room.color.g * 255}, ${room.color.b * 255})`
                  }}
                />
                <span className="truncate">Room {index + 1}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}