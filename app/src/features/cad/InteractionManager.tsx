import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useHandStore } from '../../store/handStore';
import { useCADStore } from '../../store/cadStore';
import * as THREE from 'three';

export const InteractionManager: React.FC = () => {
  const { cursorPosition, activeGesture } = useHandStore();
  const { setHovered, select, clearSelection, activeTool, addSolid, removeEntity, selectedIds } = useCADStore();
  const { camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  
  // Ref to track pinch state to prevent continuous selection
  const wasPinching = useRef(false);

  useFrame(() => {
    // 1. Update Raycaster
    const ndcX = (cursorPosition.x * 2) - 1;
    const ndcY = -(cursorPosition.y * 2) + 1;

    raycaster.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

    // 2. Intersect Objects
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    
    // Find first interactive solid
    const hit = intersects.find(i => 
      i.object instanceof THREE.Mesh && 
      i.object.userData.type === 'SOLID'
    );

    if (hit) {
      setHovered(hit.object.userData.id);
    } else {
      setHovered(null);
    }

    // 3. Handle Gestures
    const isPinching = activeGesture === 'PINCH';
    
    // SINGLE TRIGGER logic (on Pinch Start)
    if (isPinching && !wasPinching.current) {
       if (activeTool === 'SELECT') {
         if (hit) {
           select(hit.object.userData.id);
         } else {
           clearSelection();
         }
       }
    }
    
    wasPinching.current = isPinching;
  });

  return null;
};
