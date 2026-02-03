import React from 'react';
import { View, StyleSheet } from 'react-native';

interface HandLandmark {
  x: number;
  y: number;
  z?: number;
}

interface HandLandmarkOverlayProps {
  landmarks?: HandLandmark[];
  width: number;
  height: number;
  isVisible: boolean;
}

// Color scheme for different parts of the hand
const LANDMARK_COLORS = {
  wrist: '#FF0000',      // Red - Wrist (0)
  thumb: '#FF6B00',      // Orange - Thumb (1-4)
  index: '#00FF00',      // Green - Index (5-8)
  middle: '#FFFF00',     // Yellow - Middle (9-12)
  ring: '#FF00FF',       // Magenta - Ring (13-16)
  pinky: '#0000FF',      // Blue - Pinky (17-20)
  palm: '#808080'        // Gray - Palm connections
};

const getLandmarkColor = (index: number): string => {
  if (index === 0) return LANDMARK_COLORS.wrist;
  if (index >= 1 && index <= 4) return LANDMARK_COLORS.thumb;
  if (index >= 5 && index <= 8) return LANDMARK_COLORS.index;
  if (index >= 9 && index <= 12) return LANDMARK_COLORS.middle;
  if (index >= 13 && index <= 16) return LANDMARK_COLORS.ring;
  if (index >= 17 && index <= 20) return LANDMARK_COLORS.pinky;
  return LANDMARK_COLORS.palm;
};

export const HandLandmarkOverlay: React.FC<HandLandmarkOverlayProps> = ({
  landmarks,
  width,
  height,
  isVisible
}) => {
  if (!isVisible || !landmarks || landmarks.length === 0) {
    return null;
  }

  // Normalize landmarks to screen coordinates
  const normalizedLandmarks = landmarks.map(landmark => ({
    x: landmark.x * width,
    y: landmark.y * height
  }));

  return (
    <View style={[styles.overlay, { width, height }]} pointerEvents="none">
      {/* Draw landmark points as colored dots */}
      {normalizedLandmarks.map((landmark, index) => (
        <View
          key={`landmark-${index}`}
          style={[
            styles.landmarkPoint,
            {
              left: landmark.x - (index === 0 ? 8 : 6), // Wrist point is larger
              top: landmark.y - (index === 0 ? 8 : 6),
              width: index === 0 ? 16 : 12,
              height: index === 0 ? 16 : 12,
              backgroundColor: getLandmarkColor(index),
              borderRadius: index === 0 ? 8 : 6,
            }
          ]}
        />
      ))}
      
      {/* Simple connection lines for key joints */}
      {normalizedLandmarks.length >= 21 && (
        <>
          {/* Wrist to base of fingers */}
          {[5, 9, 13, 17].map((fingerBase, i) => {
            const wrist = normalizedLandmarks[0];
            const base = normalizedLandmarks[fingerBase];
            
            if (!wrist || !base) return null;
            
            const distance = Math.sqrt(Math.pow(base.x - wrist.x, 2) + Math.pow(base.y - wrist.y, 2));
            const angle = Math.atan2(base.y - wrist.y, base.x - wrist.x) * 180 / Math.PI;
            
            return (
              <View
                key={`palm-line-${i}`}
                style={[
                  styles.connectionLine,
                  {
                    left: wrist.x,
                    top: wrist.y - 1,
                    width: distance,
                    transform: [{ rotate: `${angle}deg` }],
                  }
                ]}
              />
            );
          })}
          
          {/* Finger segments */}
          {[
            [1, 2, 3, 4], // Thumb
            [5, 6, 7, 8], // Index
            [9, 10, 11, 12], // Middle
            [13, 14, 15, 16], // Ring
            [17, 18, 19, 20] // Pinky
          ].map((finger, fingerIndex) => (
            finger.slice(0, -1).map((startIdx, segmentIndex) => {
              const endIdx = finger[segmentIndex + 1];
              const start = normalizedLandmarks[startIdx];
              const end = normalizedLandmarks[endIdx];
              
              if (!start || !end) return null;
              
              const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
              const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
              
              return (
                <View
                  key={`finger-${fingerIndex}-segment-${segmentIndex}`}
                  style={[
                    styles.connectionLine,
                    {
                      left: start.x,
                      top: start.y - 1,
                      width: distance,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: getLandmarkColor(startIdx),
                    }
                  ]}
                />
              );
            })
          ))}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  landmarkPoint: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  connectionLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: LANDMARK_COLORS.palm,
    opacity: 0.7,
    transformOrigin: '0 50%',
  },
});