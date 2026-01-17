import type { Landmark, GestureType } from '../../store/handStore';

// Landmark indices
const WRIST = 0;
// const THUMB_CMC = 1; // Unused
// const THUMB_MCP = 2; // Unused
// const THUMB_IP = 3; // Unused
const THUMB_TIP = 4;
const INDEX_MCP = 5;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;
const MIDDLE_TIP = 12;
const RING_MCP = 13;
const RING_TIP = 16;
const PINKY_MCP = 17;
const PINKY_TIP = 20;

const PINCH_THRESHOLD = 0.05; // Distance threshold for pinch
const CLUTCH_THRESHOLD = 0.05; // Distance threshold for clutch (thumb-middle)

function distance(p1: Landmark, p2: Landmark): number {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
}

function isCurled(landmarks: Landmark[], tipIdx: number, mcpIdx: number): boolean {
    const wrist = landmarks[WRIST];
    const tip = landmarks[tipIdx];
    const mcp = landmarks[mcpIdx];
    // Tip closer to wrist than MCP implies curled for fingers (roughly)
    return distance(wrist, tip) < distance(wrist, mcp);
}


export function detectGesture(landmarks: Landmark[]): GestureType {
  if (!landmarks || landmarks.length < 21) return 'IDLE';

  const thumbTip = landmarks[THUMB_TIP];
  const indexTip = landmarks[INDEX_TIP];
  const middleTip = landmarks[MIDDLE_TIP];

  const pinchDist = distance(thumbTip, indexTip);
  const clutchDist = distance(thumbTip, middleTip);

  // Check for FIST (All fingers curled)
  const isIndexCurled = isCurled(landmarks, INDEX_TIP, INDEX_MCP);
  const isMiddleCurled = isCurled(landmarks, MIDDLE_TIP, MIDDLE_MCP);
  const isRingCurled = isCurled(landmarks, RING_TIP, RING_MCP);
  const isPinkyCurled = isCurled(landmarks, PINKY_TIP, PINKY_MCP);

  if (isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled) {
      return 'FIST';
  }

  // Check for CLUTCH (Thumb touching Middle finger)
  if (clutchDist < CLUTCH_THRESHOLD) {
    return 'CLUTCH';
  }

  // Check for PINCH (Thumb touching Index finger)
  if (pinchDist < PINCH_THRESHOLD) {
    return 'PINCH';
  }

  // Check for POINT (Index extended, others curled or loose)
  // Strict point: Index extended, Middle/Ring/Pinky curled
  if (!isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled) {
      return 'POINT';
  }
  
  // Relaxed point/Hover: Index extended
  if (!isIndexCurled) {
      return 'POINT'; // Treat as hover/point default
  }

  // Check for OPEN PALM
  if (!isIndexCurled && !isMiddleCurled && !isRingCurled && !isPinkyCurled) {
      return 'OPEN_PALM';
  }

  return 'IDLE';
}
