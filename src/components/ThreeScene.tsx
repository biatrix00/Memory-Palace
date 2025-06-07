import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { Room } from '../types';

interface ThreeSceneProps {
  rooms: Room[];
  onRoomChange: (roomId: string | null) => void;
  onPlayerPositionChange: (position: { x: number; z: number }) => void;
  teleportToRoom: string | null;
}

export default function ThreeScene({ 
  rooms, 
  onRoomChange, 
  onPlayerPositionChange,
  teleportToRoom 
}: ThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    labelRenderer: CSS2DRenderer;
    roomGroups: Map<string, THREE.Group>;
    pathways: THREE.Group;
  }>();
  const keysPressed = useRef<Set<string>>(new Set());
  const frameId = useRef<number>();
  const currentRoomId = useRef<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 50, 200);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 8);

    // WebGL Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x0a0a0f);
    mountRef.current.appendChild(renderer.domElement);

    // CSS2D Renderer setup for labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    mountRef.current.appendChild(labelRenderer.domElement);

    // Global lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.5);
    mainLight.position.set(0, 50, 0);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 200;
    mainLight.shadow.camera.left = -100;
    mainLight.shadow.camera.right = 100;
    mainLight.shadow.camera.top = 100;
    mainLight.shadow.camera.bottom = -100;
    scene.add(mainLight);

    const roomGroups = new Map<string, THREE.Group>();
    const pathways = new THREE.Group();
    scene.add(pathways);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      labelRenderer,
      roomGroups,
      pathways
    };

    // Event listeners
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.key.toLowerCase());
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase());
    };

    const handleResize = () => {
      if (!sceneRef.current) return;
      sceneRef.current.camera.aspect = window.innerWidth / window.innerHeight;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      if (!sceneRef.current) return;

      const { camera, renderer, labelRenderer } = sceneRef.current;
      const moveSpeed = 0.15;

      // WASD movement
      if (keysPressed.current.has('w')) {
        camera.position.z -= moveSpeed;
      }
      if (keysPressed.current.has('s')) {
        camera.position.z += moveSpeed;
      }
      if (keysPressed.current.has('a')) {
        camera.position.x -= moveSpeed;
      }
      if (keysPressed.current.has('d')) {
        camera.position.x += moveSpeed;
      }

      // Update player position
      onPlayerPositionChange({ x: camera.position.x, z: camera.position.z });

      // Check which room the player is in
      const newRoomId = getCurrentRoom(camera.position, rooms);
      if (newRoomId !== currentRoomId.current) {
        currentRoomId.current = newRoomId;
        onRoomChange(newRoomId);
      }

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
      frameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      if (mountRef.current && labelRenderer.domElement) {
        mountRef.current.removeChild(labelRenderer.domElement);
      }
      
      renderer.dispose();
    };
  }, []);

  // Handle teleportation
  useEffect(() => {
    if (!teleportToRoom || !sceneRef.current) return;

    const room = rooms.find(r => r.id === teleportToRoom);
    if (room) {
      sceneRef.current.camera.position.set(
        room.concept.position.x,
        3,
        room.concept.position.z + 8
      );
    }
  }, [teleportToRoom, rooms]);

  // Update rooms when they change
  useEffect(() => {
    if (!sceneRef.current) return;

    const { scene, roomGroups, pathways } = sceneRef.current;

    // Clear existing rooms
    roomGroups.forEach(group => {
      scene.remove(group);
    });
    roomGroups.clear();
    pathways.clear();

    // Create new rooms
    rooms.forEach(room => {
      const roomGroup = createRoom(room);
      roomGroups.set(room.id, roomGroup);
      scene.add(roomGroup);
    });

    // Create pathways between rooms
    createPathways(rooms, pathways);

  }, [rooms]);

  return <div ref={mountRef} className="w-full h-full" />;
}

function createRoom(room: Room): THREE.Group {
  const group = new THREE.Group();
  const { concept, color, objects, size, lighting } = room;
  
  group.position.set(concept.position.x, concept.position.y, concept.position.z);

  // Room dimensions from the room object
  const { width, height, depth } = size;

  // Floor with enhanced material
  const floorGeometry = new THREE.PlaneGeometry(width, depth);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color(color.r * 0.5, color.g * 0.5, color.b * 0.5),
    transparent: true,
    opacity: 0.9,
    roughness: 0.7,
    metalness: 0.1
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Enhanced room lighting
  const roomLight = new THREE.PointLight(
    new THREE.Color(lighting.color),
    lighting.intensity * 1.5,
    width * 2.5,
    2
  );
  roomLight.position.set(0, height * 0.8, 0);
  roomLight.castShadow = true;
  group.add(roomLight);

  // Add ambient light specific to the room
  const roomAmbient = new THREE.AmbientLight(
    new THREE.Color(lighting.color),
    lighting.intensity * 0.3
  );
  group.add(roomAmbient);

  // Walls with enhanced material
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color(color.r * 0.7, color.g * 0.7, color.b * 0.7),
    transparent: true,
    opacity: 0.7,
    roughness: 0.5,
    metalness: 0.2
  });

  // Create walls with slight gaps for better visibility
  const wallThickness = 0.2;
  const wallHeight = height;
  const wallOffset = 0.1; // Small gap between walls

  // Back wall
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(width + wallThickness * 2, wallHeight, wallThickness),
    wallMaterial
  );
  backWall.position.set(0, wallHeight / 2, -depth / 2 - wallThickness / 2);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  group.add(backWall);

  // Front wall with door
  const frontWall = new THREE.Mesh(
    createWallWithDoor(width, wallHeight),
    wallMaterial
  );
  frontWall.position.set(0, wallHeight / 2, depth / 2 + wallThickness / 2);
  frontWall.castShadow = true;
  frontWall.receiveShadow = true;
  group.add(frontWall);

  // Side walls
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, wallHeight, depth + wallThickness * 2),
    wallMaterial
  );
  leftWall.position.set(-width / 2 - wallThickness / 2, wallHeight / 2, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  group.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, wallHeight, depth + wallThickness * 2),
    wallMaterial
  );
  rightWall.position.set(width / 2 + wallThickness / 2, wallHeight / 2, 0);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // Add objects with enhanced materials and shadows
  objects.forEach(obj => {
    const mesh = createObject(obj);
    if (mesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
  });

  // Add room label
  const labelDiv = document.createElement('div');
  labelDiv.className = 'room-label';
  labelDiv.textContent = concept.name;
  labelDiv.style.color = '#ffffff';
  labelDiv.style.padding = '4px 8px';
  labelDiv.style.background = 'rgba(0, 0, 0, 0.7)';
  labelDiv.style.borderRadius = '4px';
  labelDiv.style.fontSize = '14px';
  labelDiv.style.fontWeight = 'bold';
  labelDiv.style.pointerEvents = 'none';

  const label = new CSS2DObject(labelDiv);
  label.position.set(0, height + 1, 0);
  group.add(label);

  return group;
}

function createWallWithDoor(width: number, height: number): THREE.BufferGeometry {
  const doorWidth = 3;
  const doorHeight = 6;
  
  const shape = new THREE.Shape();
  
  // Outer rectangle
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(width / 2, height);
  shape.lineTo(-width / 2, height);
  shape.lineTo(-width / 2, 0);
  
  // Door hole
  const doorHole = new THREE.Path();
  doorHole.moveTo(-doorWidth / 2, 0);
  doorHole.lineTo(doorWidth / 2, 0);
  doorHole.lineTo(doorWidth / 2, doorHeight);
  doorHole.lineTo(-doorWidth / 2, doorHeight);
  doorHole.lineTo(-doorWidth / 2, 0);
  
  shape.holes.push(doorHole);
  
  return new THREE.ShapeGeometry(shape);
}

function createObject(obj: any): THREE.Mesh | null {
  const { type, position, scale, color } = obj;
  let geometry: THREE.BufferGeometry;
  
  switch (type) {
    case 'cube':
      geometry = new THREE.BoxGeometry(1, 1, 1);
      break;
    case 'sphere':
      geometry = new THREE.SphereGeometry(0.5, 32, 32);
      break;
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
      break;
    case 'pyramid':
      geometry = new THREE.ConeGeometry(0.5, 1, 4);
      break;
    default:
      return null;
  }

  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.4,
    metalness: 0.2,
    transparent: true,
    opacity: 0.9
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);
  mesh.scale.set(scale.x, scale.y, scale.z);
  
  return mesh;
}

function createPathways(rooms: Room[], pathwaysGroup: THREE.Group): void {
  if (rooms.length <= 1) return;

  const material = new THREE.MeshStandardMaterial({
    color: 0x666666,
    transparent: true,
    opacity: 0.3,
    roughness: 0.8,
    metalness: 0.1
  });

  // Create pathways between adjacent rooms
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const room1 = rooms[i];
      const room2 = rooms[j];

      // Calculate distance between rooms
      const distance = Math.sqrt(
        Math.pow(room2.concept.position.x - room1.concept.position.x, 2) +
        Math.pow(room2.concept.position.z - room1.concept.position.z, 2)
      );

      // Only create pathways between nearby rooms
      if (distance < 50) {
        const pathGeometry = new THREE.BoxGeometry(2, 0.1, distance);
        const path = new THREE.Mesh(pathGeometry, material);

        // Position and rotate the path
        const midX = (room1.concept.position.x + room2.concept.position.x) / 2;
        const midZ = (room1.concept.position.z + room2.concept.position.z) / 2;
        path.position.set(midX, 0.05, midZ);

        const angle = Math.atan2(
          room2.concept.position.z - room1.concept.position.z,
          room2.concept.position.x - room1.concept.position.x
        );
        path.rotation.y = angle;

        path.receiveShadow = true;
        pathwaysGroup.add(path);
      }
    }
  }
}

function getCurrentRoom(position: THREE.Vector3, rooms: Room[]): string | null {
  const roomRadius = 10;
  
  for (const room of rooms) {
    const distance = Math.sqrt(
      Math.pow(position.x - room.concept.position.x, 2) +
      Math.pow(position.z - room.concept.position.z, 2)
    );
    
    if (distance < roomRadius) {
      return room.id;
    }
  }
  
  return null;
}