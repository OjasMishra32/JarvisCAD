import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useHandStore } from '../../store/handStore';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface HandControlsProps {
    controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export const HandControls: React.FC<HandControlsProps> = ({ controlsRef }) => {
    const { activeGesture, cursorPosition } = useHandStore();
    const prevCursorPos = useRef<{ x: number, y: number } | null>(null);

    useFrame(() => {
        if (!controlsRef.current) return;

        // MVP Mapping: CLUTCH (Thumb-Middle) = Orbit
        if (activeGesture === 'CLUTCH') {
            if (prevCursorPos.current) {
                const deltaX = (cursorPosition.x - prevCursorPos.current.x) * 5; // Sensitivity
                const deltaY = (cursorPosition.y - prevCursorPos.current.y) * 5;

                // Cast to any to access internal rotation methods if types are missing
                const controls = controlsRef.current as any;
                if (controls.rotateLeft && controls.rotateUp) {
                    controls.rotateLeft(deltaX); 
                    controls.rotateUp(deltaY);
                    controls.update();
                }
            }
            prevCursorPos.current = cursorPosition;
        } else {
            prevCursorPos.current = null;
        }
    });

    return null;
};
