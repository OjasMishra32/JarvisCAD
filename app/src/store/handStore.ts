import { create } from 'zustand';

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  landmarks: Landmark[];
  worldLandmarks: Landmark[];
  handedness: 'Left' | 'Right';
  score: number;
  gesture?: GestureType; // Inferred gesture
}

export type GestureType = 'IDLE' | 'POINT' | 'PINCH' | 'CLUTCH' | 'FIST' | 'OPEN_PALM';

interface HandState {
  hands: HandData[];
  isTracking: boolean;
  
  // Primary interaction state (usually derived from Dominant Hand)
  activeGesture: GestureType;
  cursorPosition: { x: number; y: number }; // Screen coordinates (0-1)

  setHands: (hands: HandData[]) => void;
  setIsTracking: (isTracking: boolean) => void;
  setActiveGesture: (gesture: GestureType) => void;
  setCursorPosition: (pos: { x: number; y: number }) => void;
}

export const useHandStore = create<HandState>((set) => ({
  hands: [],
  isTracking: false,
  activeGesture: 'IDLE',
  cursorPosition: { x: 0.5, y: 0.5 },
  
  setHands: (hands) => set({ hands }),
  setIsTracking: (isTracking) => set({ isTracking }),
  setActiveGesture: (activeGesture) => set({ activeGesture }),
  setCursorPosition: (cursorPosition) => set({ cursorPosition }),
}));
