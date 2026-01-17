import { Viewport } from './features/cad/Viewport';
import { HandTracker } from './features/hand-tracking/HandTracker';
import { HandOverlay } from './features/hand-tracking/HandOverlay';
import { HUD } from './features/ui/HUD';

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black text-white relative">
      <HandTracker />
      
      {/* Main 3D Viewport */}
      <div className="absolute inset-0 z-0">
        <Viewport />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <HandOverlay />
        <HUD />
        
        <div className="absolute top-4 left-4 p-4 pointer-events-auto">
          <h1 className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
            StarkCAD
          </h1>
          <p className="text-sm text-cyan-200/70">System Initialized</p>
        </div>
      </div>
    </div>
  );
}

export default App;
