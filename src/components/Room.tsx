import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere } from '@react-three/drei';

interface RoomProps {
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
  isActive: boolean;
}

export default function Room({
  position,
  size,
  color,
  objects,
  lighting,
  isActive
}: RoomProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Animate room when active
  useFrame((state, delta) => {
    if (groupRef.current && isActive) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Room floor */}
      <Box
        args={[size[0], 0.1, size[2]]}
        position={[0, -size[1] / 2, 0]}
      >
        <meshStandardMaterial color={color} />
      </Box>

      {/* Room walls */}
      <Box
        args={[size[0], size[1], 0.1]}
        position={[0, 0, -size[2] / 2]}
      >
        <meshStandardMaterial color={color} />
      </Box>
      <Box
        args={[size[0], size[1], 0.1]}
        position={[0, 0, size[2] / 2]}
      >
        <meshStandardMaterial color={color} />
      </Box>
      <Box
        args={[0.1, size[1], size[2]]}
        position={[-size[0] / 2, 0, 0]}
      >
        <meshStandardMaterial color={color} />
      </Box>
      <Box
        args={[0.1, size[1], size[2]]}
        position={[size[0] / 2, 0, 0]}
      >
        <meshStandardMaterial color={color} />
      </Box>

      {/* Room objects */}
      {objects.map((obj, index) => (
        <Box
          key={index}
          args={obj.size}
          position={obj.position}
        >
          <meshStandardMaterial 
            color={obj.color}
            metalness={0.5}
            roughness={0.5}
          />
        </Box>
      ))}

      {/* Room lighting */}
      <pointLight
        position={[0, size[1] / 2, 0]}
        intensity={lighting.intensity}
        color={lighting.color}
        distance={size[0] * 2}
        decay={2}
      />

      {/* Ambient light for better visibility */}
      <ambientLight intensity={0.2} />
    </group>
  );
} 