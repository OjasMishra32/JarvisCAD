import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useCADStore } from '../../store/cadStore';
import type { SolidPrimitive, SketchPrimitive } from '../../store/cadStore';
import { Line } from '@react-three/drei';

export const GeometryRenderer: React.FC = () => {
  const { solids, sketches, hoveredId, selectedIds } = useCADStore();

  return (
    <group>
      {solids.map((solid) => (
        <SolidMesh 
          key={solid.id} 
          data={solid} 
          isHovered={hoveredId === solid.id}
          isSelected={selectedIds.includes(solid.id)}
        />
      ))}
      {sketches.map((sketch) => (
        <SketchMesh 
            key={sketch.id}
            data={sketch}
            isHovered={hoveredId === sketch.id}
            isSelected={selectedIds.includes(sketch.id)}
        />
      ))}
    </group>
  );
};

const SolidMesh: React.FC<{ 
  data: SolidPrimitive; 
  isHovered: boolean; 
  isSelected: boolean; 
}> = ({ data, isHovered, isSelected }) => {
  
  const geometry = useMemo(() => {
    switch (data.type) {
      case 'CUBE':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'SPHERE':
        return new THREE.SphereGeometry(0.5, 32, 32);
      case 'EXTRUDE':
        // Placeholder for extrude geometry
        return new THREE.BoxGeometry(1, 1, 1);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [data.type, data.params]);

  return (
    <mesh
      position={[data.position.x, data.position.y, data.position.z]}
      rotation={[data.rotation.x, data.rotation.y, data.rotation.z]}
      scale={[data.scale.x, data.scale.y, data.scale.z]}
      castShadow
      receiveShadow
      userData={{ id: data.id, type: 'SOLID' }}
    >
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial 
        color={isSelected ? "#22d3ee" : (isHovered ? "#fb923c" : data.color)}
        emissive={isSelected ? "#22d3ee" : "black"}
        emissiveIntensity={isSelected ? 0.4 : 0}
        metalness={0.5}
        roughness={0.5}
      />
    </mesh>
  );
};

const SketchMesh: React.FC<{
    data: SketchPrimitive;
    isHovered: boolean;
    isSelected: boolean;
}> = ({ data, isHovered, isSelected }) => {
    // Convert Point3D to Vector3
    const points = useMemo(() => {
        if (data.type === 'RECT') {
            const p1 = data.points[0];
            const p2 = data.points[1];
            // Construct rectangle points
            return [
                new THREE.Vector3(p1.x, p1.y, p1.z),
                new THREE.Vector3(p2.x, p1.y, p2.z), // Assuming XZ plane for MVP
                new THREE.Vector3(p2.x, p2.y, p2.z),
                new THREE.Vector3(p1.x, p2.y, p1.z),
                new THREE.Vector3(p1.x, p1.y, p1.z), // Close loop
            ];
        }
        return data.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
    }, [data]);

    return (
        <Line 
            points={points}
            color={isSelected ? "#22d3ee" : (isHovered ? "#fb923c" : "white")}
            lineWidth={isSelected ? 3 : 1}
            userData={{ id: data.id, type: 'SKETCH' }}
        />
    );
};
