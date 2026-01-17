import React from 'react';
import { useHandStore } from '../../store/handStore';

export const HandOverlay: React.FC = () => {
  const { hands, isTracking } = useHandStore();

  if (!isTracking) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-50">
      {hands.map((hand, index) => (
        <g key={index}>
          {/* Connections */}
          {HAND_CONNECTIONS.map(([start, end], i) => {
            const p1 = hand.landmarks[start];
            const p2 = hand.landmarks[end];
            return (
              <line
                key={i}
                x1={`${p1.x * 100}%`}
                y1={`${p1.y * 100}%`}
                x2={`${p2.x * 100}%`}
                y2={`${p2.y * 100}%`}
                stroke={hand.handedness === 'Right' ? '#22d3ee' : '#f472b6'} // Cyan for Right, Pink for Left
                strokeWidth="2"
                strokeOpacity="0.6"
              />
            );
          })}
          
          {/* Landmarks */}
          {hand.landmarks.map((lm, i) => (
            <circle
              key={i}
              cx={`${lm.x * 100}%`}
              cy={`${lm.y * 100}%`}
              r={i === 8 ? 6 : 3} // Index finger tip larger
              fill={i === 8 ? '#ffffff' : (hand.handedness === 'Right' ? '#22d3ee' : '#f472b6')}
              className={i === 8 ? 'filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}
            />
          ))}
        </g>
      ))}
    </svg>
  );
};

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17] // Palm
];
