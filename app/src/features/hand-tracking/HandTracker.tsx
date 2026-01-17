import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useHandStore } from '../../store/handStore';

import { detectGesture } from './GestureRecognizer';

export const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setHands, setIsTracking, setActiveGesture, setCursorPosition } = useHandStore();
  const [error, setError] = useState<string | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    let active = true;

    const setup = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        if (!active) return;

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        if (!active) return;
        landmarkerRef.current = landmarker;

        // Start Camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720,
            frameRate: { ideal: 60 }
          }
        });

        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predict);
          setIsTracking(true);
        }
      } catch (err) {
        console.error("Error initializing hand tracking:", err);
        setError("Failed to initialize hand tracking. Camera permission might be denied.");
      }
    };

    setup();

    return () => {
      active = false;
      setIsTracking(false);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  const predict = () => {
    if (landmarkerRef.current && videoRef.current && videoRef.current.readyState >= 2) {
      const startTimeMs = performance.now();
      const result = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      if (result.landmarks && result.landmarks.length > 0) {
        const hands = result.landmarks.map((landmarks, index) => {
          const gesture = detectGesture(landmarks);
          return {
            landmarks,
            worldLandmarks: result.worldLandmarks[index],
            handedness: result.handedness[index][0].categoryName as 'Left' | 'Right',
            score: result.handedness[index][0].score,
            gesture
          };
        });
        setHands(hands);

        // Assume Primary Interaction Hand (Right Hand or First Hand)
        // For MVP: Prefer Right hand, else First hand
        const primaryHand = hands.find(h => h.handedness === 'Right') || hands[0];
        if (primaryHand) {
            setActiveGesture(primaryHand.gesture || 'IDLE');
            // Update Cursor (Index Tip 8)
            // Mirror X because webcam is mirrored
            const indexTip = primaryHand.landmarks[8];
            setCursorPosition({ x: 1 - indexTip.x, y: indexTip.y });
        } else {
            setActiveGesture('IDLE');
        }

      } else {
        setHands([]);
        setActiveGesture('IDLE');
      }
    }
    requestRef.current = requestAnimationFrame(predict);
  };

  return (
    <div className="absolute bottom-4 left-4 z-50 pointer-events-none">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-48 h-auto rounded-lg border border-cyan-500/30 opacity-50 hidden" // Hidden by default, can toggle for debug
      />
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 p-2 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
