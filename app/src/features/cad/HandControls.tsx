import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useHandStore } from '../../store/handStore';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface HandControlsProps {
    controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export const HandControls: React.FC<HandControlsProps> = ({ controlsRef }) => {
    const { activeGesture, cursorPosition } = useHandStore();
    const prevCursorPos = useRef<{ x: number, y: number } | null>(null);
    const { camera } = useThree();

    useFrame(() => {
        if (!controlsRef.current) return;

        // MVP Mapping: CLUTCH (Thumb-Middle) = Orbit
        if (activeGesture === 'CLUTCH') {
            if (prevCursorPos.current) {
                const deltaX = (cursorPosition.x - prevCursorPos.current.x) * 5; // Sensitivity
                const deltaY = (cursorPosition.y - prevCursorPos.current.y) * 5;

                // OrbitControls uses spherical coordinates
                // rotateLeft changes azimuthal angle
                // rotateUp changes polar angle
                controlsRef.current.rotateLeft(deltaX); 
                controlsRef.current.rotateUp(deltaY);
                controlsRef.current.update();
            }
            prevCursorPos.current = cursorPosition;
        } else {
            prevCursorPos.current = null;
        }
    });

    return null;
};
