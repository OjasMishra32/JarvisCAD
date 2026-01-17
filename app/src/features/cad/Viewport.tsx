import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { HandControls } from './HandControls';
import { InteractionManager } from './InteractionManager';
import { GeometryRenderer } from './GeometryEngine';
import { SketchPlane } from './SketchPlane';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export const Viewport: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <div className="w-full h-full bg-slate-900">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        shadows
      >
        <color attach="background" args={['#1e1e1e']} />
        
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        
        {/* Environment / Grid */}
        <Grid 
          infiniteGrid 
          fadeDistance={30} 
          sectionColor="#4a4a4a" 
          cellColor="#2a2a2a"
        />
        <Environment preset="city" />

        {/* Controls & Interaction */}
        <OrbitControls ref={controlsRef} makeDefault />
        <HandControls controlsRef={controlsRef} />
        <InteractionManager />
        <SketchPlane />

        {/* Scene Content */}
        <GeometryRenderer />

      </Canvas>
    </div>
  );
};
