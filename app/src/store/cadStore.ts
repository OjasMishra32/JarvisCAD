import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type ToolMode = 'SELECT' | 'SKETCH_LINE' | 'SKETCH_RECT' | 'SKETCH_CIRCLE' | 'EXTRUDE' | 'MOVE';

export interface Point2D { x: number; y: number; }
export interface Point3D { x: number; y: number; z: number; }

// Basic CAD Entities
export interface SketchPrimitive {
  id: string;
  type: 'LINE' | 'RECT' | 'CIRCLE';
  points: Point3D[]; // Simplified to 3D points for MVP (usually on a plane)
  planeNormal: Point3D;
  planeOrigin: Point3D;
  params?: any; // radius, width, etc.
}

export interface SolidPrimitive {
  id: string;
  type: 'CUBE' | 'SPHERE' | 'EXTRUDE';
  position: Point3D;
  rotation: Point3D;
  scale: Point3D;
  sketchId?: string; // For extrusions
  params?: any; // dimensions
  color: string;
}

export interface CADState {
  // State
  activeTool: ToolMode;
  sketches: SketchPrimitive[];
  solids: SolidPrimitive[];
  selectedIds: string[];
  hoveredId: string | null;
  history: any[]; // Undo/Redo stack (simplified)

  // Actions
  setTool: (tool: ToolMode) => void;
  addSolid: (solid: Omit<SolidPrimitive, 'id'>) => void;
  addSketch: (sketch: Omit<SketchPrimitive, 'id'>) => void;
  updateSolid: (id: string, updates: Partial<SolidPrimitive>) => void;
  removeEntity: (id: string) => void;
  
  select: (id: string, multi?: boolean) => void;
  deselect: (id: string) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
}

export const useCADStore = create<CADState>((set) => ({
  activeTool: 'SELECT',
  sketches: [],
  solids: [{
    id: 'default-cube',
    type: 'CUBE',
    position: { x: 0, y: 0.5, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    params: { size: 1 },
    color: 'orange'
  }],
  selectedIds: [],
  hoveredId: null,
  history: [],

  setTool: (tool) => set({ activeTool: tool }),
  
  addSolid: (solid) => set((state) => ({
    solids: [...state.solids, { ...solid, id: uuidv4() }]
  })),

  addSketch: (sketch) => set((state) => ({
    sketches: [...state.sketches, { ...sketch, id: uuidv4() }]
  })),

  updateSolid: (id, updates) => set((state) => ({
    solids: state.solids.map(s => s.id === id ? { ...s, ...updates } : s)
  })),

  removeEntity: (id) => set((state) => ({
    solids: state.solids.filter(s => s.id !== id),
    sketches: state.sketches.filter(s => s.id !== id),
    selectedIds: state.selectedIds.filter(sid => sid !== id)
  })),

  select: (id, multi = false) => set((state) => ({
    selectedIds: multi ? [...state.selectedIds, id] : [id]
  })),
  
  deselect: (id) => set((state) => ({
    selectedIds: state.selectedIds.filter((i) => i !== id)
  })),
  
  clearSelection: () => set({ selectedIds: [] }),
  
  setHovered: (id) => set({ hoveredId: id }),
}));
