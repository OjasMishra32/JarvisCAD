import React, { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useHandStore } from '../../store/handStore';
import { useCADStore, Point3D } from '../../store/cadStore';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

export const SketchPlane: React.FC = () => {
  const { cursorPosition, activeGesture } = useHandStore();
  const { activeTool, addSketch } = useCADStore();
  const { camera, scene } = useThree();
  
  const planeRef = useRef<THREE.Mesh>(null);
  const [currentPoints, setCurrentPoints] = useState<THREE.Vector3[]>([]);
  const isSketching = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());

  // Only active if tool is SKETCH_*
  const isSketchMode = activeTool.startsWith('SKETCH');

  useFrame(() => {
    if (!isSketchMode || !planeRef.current) return;

    // Raycast to the sketch plane (XZ plane for MVP)
    const ndcX = (cursorPosition.x * 2) - 1;
    const ndcY = -(cursorPosition.y * 2) + 1;
    raycaster.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    
    const intersects = raycaster.current.intersectObject(planeRef.current);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      
      // LOGIC:
      // PINCH START -> Start Drawing
      // PINCH HOLD -> Dragging (Preview)
      // PINCH RELEASE -> Finish Drawing
      
      const isPinching = activeGesture === 'PINCH';
      
      if (isPinching && !isSketching.current) {
        // Start Sketch
        isSketching.current = true;
        setCurrentPoints([point, point]);
      } else if (isPinching && isSketching.current) {
        // Dragging
        setCurrentPoints(prev => [prev[0], point]);
      } else if (!isPinching && isSketching.current) {
        // End Sketch
        isSketching.current = false;
        const start = currentPoints[0];
        const end = point; // Last known point
        
        // Commit to Store
        // Convert THREE.Vector3 to Point3D
        const p1 = { x: start.x, y: start.y, z: start.z };
        const p2 = { x: end.x, y: end.y, z: end.z };
        
        if (activeTool === 'SKETCH_RECT') {
            // Create 4 points for rect
            // Simplified: Just store diagonal for now or center/size
            // Let's store as a RECT primitive
            addSketch({
                type: 'RECT',
                points: [p1, p2],
                planeNormal: { x: 0, y: 1, z: 0 },
                planeOrigin: { x: 0, y: 0, z: 0 }
            });
        } else {
            // Default Line
             addSketch({
                type: 'LINE',
                points: [p1, p2],
                planeNormal: { x: 0, y: 1, z: 0 },
                planeOrigin: { x: 0, y: 0, z: 0 }
            });
        }
        
        setCurrentPoints([]);
      }
    }
  });

  if (!isSketchMode) return null;

  return (
    <group>
      {/* Invisible Plane for Raycasting */}
      <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} visible={false}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial side={THREE.DoubleSide} />
      </mesh>

      {/* Grid Overlay to show we are sketching */}
      <gridHelper args={[10, 10, 0x22d3ee, 0x22d3ee]} position={[0, 0.01, 0]} />

      {/* Current Sketch Preview */}
      {currentPoints.length > 1 && (
         <Line 
           points={currentPoints}
           color="#22d3ee"
           lineWidth={2}
         />
      )}
    </group>
  );
};
