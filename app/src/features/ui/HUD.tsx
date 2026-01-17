import React, { useState, useEffect } from 'react';
import { RadialMenu } from './RadialMenu';
import { Mic, Hand, MousePointer2, Move, Grip, Pencil, Box } from 'lucide-react';
import { useHandStore } from '../../store/handStore';
import { useCADStore } from '../../store/cadStore';
import { AIService } from '../../features/ai/AIService';

// Initialize AI Service (Mock Key for MVP)
const aiService = new AIService(import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY');

export const HUD: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [isListening, setIsListening] = useState(false);
  const { activeGesture, cursorPosition, isTracking } = useHandStore();
  const { activeTool, addSolid, selectedIds } = useCADStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setMenuPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        setMenuOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAICommand = async () => {
      setIsListening(true);
      // Simulate Voice Input for MVP (User types into prompt or just hardcoded for demo)
      // In real app: Speech Recognition API
      const command = prompt("Enter AI Command (e.g. 'Create a blue cube')");
      if (command) {
          try {
              const result = await aiService.interpretCommand(command, {
                  selection: selectedIds,
                  mode: activeTool,
                  history: []
              });
              
              console.log("AI Result:", result);
              
              if (result.operation === 'CREATE_SOLID') {
                   addSolid({
                      type: result.parameters.type,
                      position: { x: 0, y: 2, z: 0 },
                      rotation: { x: 0, y: 0, z: 0 },
                      scale: { x: 1, y: 1, z: 1 },
                      params: result.parameters,
                      color: result.parameters.color || 'white'
                   });
              }
          } catch (e) {
              console.error(e);
          }
      }
      setIsListening(false);
  };

  const getGestureIcon = () => {
    switch (activeGesture) {
      case 'CLUTCH': return <Grip className="w-6 h-6 text-yellow-400" />;
      case 'PINCH': return <MousePointer2 className="w-6 h-6 text-green-400" />;
      case 'POINT': return <Move className="w-6 h-6 text-cyan-400" />;
      case 'OPEN_PALM': return <Hand className="w-6 h-6 text-white" />;
      default: return <Hand className="w-6 h-6 text-slate-500" />;
    }
  };
  
  const getToolIcon = () => {
      if (activeTool.startsWith('SKETCH')) return <Pencil className="w-5 h-5 text-cyan-400" />;
      if (activeTool === 'SELECT') return <MousePointer2 className="w-5 h-5 text-cyan-400" />;
      return <Box className="w-5 h-5 text-cyan-400" />;
  };

  return (
    <>
      <RadialMenu 
        isOpen={menuOpen} 
        x={menuPos.x} 
        y={menuPos.y} 
        onClose={() => setMenuOpen(false)} 
      />

      {/* Top Center Status Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-2 bg-slate-900/80 border border-slate-700 rounded-full backdrop-blur-sm pointer-events-auto shadow-lg">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`} />
            <span className="text-xs text-slate-300 font-mono">TRACKING</span>
         </div>
         <div className="w-px h-4 bg-slate-700" />
         <div className="flex items-center gap-2 min-w-[100px] justify-center">
            {getGestureIcon()}
            <span className="text-sm font-bold text-cyan-100">{activeGesture}</span>
         </div>
         <div className="w-px h-4 bg-slate-700" />
         <div className="flex items-center gap-2 min-w-[120px] justify-center text-cyan-300">
             {getToolIcon()}
             <span className="text-sm font-bold">{activeTool}</span>
         </div>
      </div>

      {/* Bottom Toolbar / AI Trigger */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 pointer-events-auto">
        <button 
          className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] ${isListening ? 'bg-cyan-500 border-white animate-pulse' : 'bg-slate-900/80 border-cyan-500/50 hover:bg-slate-800'}`}
          onClick={handleAICommand}
        >
          <Mic className={`w-6 h-6 ${isListening ? 'text-white' : 'text-cyan-400'}`} />
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 text-xs text-cyan-200/50 text-right pointer-events-none space-y-1">
        <p>SPACE: Menu</p>
        <p>CLUTCH: Orbit</p>
        <p>PINCH: Select / Draw</p>
      </div>
      
      {/* Debug Cursor Pos */}
      <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 font-mono">
        X: {cursorPosition.x.toFixed(2)} Y: {cursorPosition.y.toFixed(2)}
      </div>
    </>
  );
};
