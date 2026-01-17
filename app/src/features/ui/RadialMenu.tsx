import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, Box, Circle, Trash2, Pencil, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { useCADStore } from '../../store/cadStore';
import { useExport } from '../cad/ExportManager';

interface RadialMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
}

export const RadialMenu: React.FC<RadialMenuProps> = ({ isOpen, x, y, onClose }) => {
  const radius = 90; // Distance from center
  const store = useCADStore();
  const { exportSTL } = useExport();

  const MENU_ITEMS = [
    { id: 'select', icon: MousePointer2, label: 'Select', color: 'text-cyan-400', action: (store: any) => store.setTool('SELECT') },
    { id: 'sketch', icon: Pencil, label: 'Sketch Line', color: 'text-green-400', action: (store: any) => store.setTool('SKETCH_LINE') },
    // Removed duplicate rect since it wasn't working well with imports in original
    // { id: 'rect', icon: PenTool, label: 'Sketch Rect', color: 'text-emerald-400', action: (store: any) => store.setTool('SKETCH_RECT') },
    { id: 'cube', icon: Box, label: 'Cube', color: 'text-blue-400', action: (store: any) => store.addSolid({ 
        type: 'CUBE', 
        position: { x: (Math.random()-0.5)*2, y: 0.5, z: (Math.random()-0.5)*2 }, 
        rotation: { x: 0, y: 0, z: 0 }, 
        scale: { x: 1, y: 1, z: 1 }, 
        params: { size: 1 }, 
        color: '#3b82f6' 
      }) 
    },
    { id: 'sphere', icon: Circle, label: 'Sphere', color: 'text-purple-400', action: (store: any) => store.addSolid({ 
        type: 'SPHERE', 
        position: { x: (Math.random()-0.5)*2, y: 0.5, z: (Math.random()-0.5)*2 }, 
        rotation: { x: 0, y: 0, z: 0 }, 
        scale: { x: 1, y: 1, z: 1 }, 
        params: { radius: 0.5 }, 
        color: '#a855f7' 
      })
    },
    { id: 'delete', icon: Trash2, label: 'Delete', color: 'text-red-400', action: (store: any) => {
        store.selectedIds.forEach((id: string) => store.removeEntity(id));
        store.clearSelection();
      }
    },
    { id: 'export', icon: Download, label: 'Export STL', color: 'text-yellow-400', action: () => exportSTL() },
  ];

  const handleItemClick = (item: typeof MENU_ITEMS[0]) => {
    item.action(store);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{ left: x, top: y }}
        >
          {/* Center Button (Close/Confirm) */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={onClose}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/90 border border-cyan-500/50 flex items-center justify-center pointer-events-auto backdrop-blur-md"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]" />
          </motion.button>

          {/* Menu Items */}
          {MENU_ITEMS.map((item, index) => {
            const angle = (index / MENU_ITEMS.length) * 2 * Math.PI - Math.PI / 2;
            const tx = Math.cos(angle) * radius;
            const ty = Math.sin(angle) * radius;

            return (
              <motion.button
                key={item.label}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{ x: tx, y: ty, opacity: 1, scale: 1 }}
                exit={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleItemClick(item)}
                className={clsx(
                  "absolute w-12 h-12 rounded-full bg-slate-800/80 border border-slate-600 flex items-center justify-center pointer-events-auto hover:bg-slate-700 hover:border-cyan-400 transition-colors shadow-lg",
                  "-translate-x-1/2 -translate-y-1/2"
                )}
              >
                <item.icon className={clsx("w-6 h-6", item.color)} />
              </motion.button>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
};
