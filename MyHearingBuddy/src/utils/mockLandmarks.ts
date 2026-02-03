// Mock hand landmarks for testing the overlay
// These represent the 21 MediaPipe hand landmarks in normalized coordinates (0-1)

export const generateMockHandLandmarks = (gesture: string = 'A'): Array<{x: number, y: number}> => {
  // Base hand shape (open palm)
  const baseLandmarks = [
    // Wrist
    { x: 0.5, y: 0.8 },
    
    // Thumb (1-4)
    { x: 0.4, y: 0.75 },
    { x: 0.35, y: 0.7 },
    { x: 0.3, y: 0.65 },
    { x: 0.25, y: 0.6 },
    
    // Index finger (5-8)
    { x: 0.45, y: 0.7 },
    { x: 0.43, y: 0.55 },
    { x: 0.42, y: 0.4 },
    { x: 0.41, y: 0.25 },
    
    // Middle finger (9-12)
    { x: 0.5, y: 0.7 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.3 },
    { x: 0.5, y: 0.15 },
    
    // Ring finger (13-16)
    { x: 0.55, y: 0.7 },
    { x: 0.57, y: 0.55 },
    { x: 0.58, y: 0.4 },
    { x: 0.59, y: 0.25 },
    
    // Pinky (17-20)
    { x: 0.6, y: 0.75 },
    { x: 0.63, y: 0.6 },
    { x: 0.65, y: 0.45 },
    { x: 0.67, y: 0.3 }
  ];

  // Modify landmarks based on gesture
  switch (gesture.toUpperCase()) {
    case 'A':
      // Closed fist with thumb out
      return baseLandmarks.map((point, index) => {
        if (index >= 5 && index <= 20 && index % 4 !== 1) {
          // Bend fingers down (except thumb)
          return { x: point.x, y: point.y + 0.2 };
        }
        return point;
      });
      
    case 'B':
      // Flat hand, fingers together
      return baseLandmarks.map((point, index) => {
        if (index >= 1 && index <= 4) {
          // Thumb tucked in
          return { x: point.x + 0.1, y: point.y + 0.1 };
        }
        return point;
      });
      
    case 'C':
      // Curved hand like holding a cup
      return baseLandmarks.map((point, index) => {
        if (index >= 5) {
          // Curve all fingers
          return { x: point.x + (index % 2 === 0 ? -0.05 : 0.05), y: point.y + 0.1 };
        }
        return point;
      });
      
    case 'L':
      // L shape - index up, thumb out
      return baseLandmarks.map((point, index) => {
        if ((index >= 9 && index <= 20) && index !== 5 && index !== 6 && index !== 7 && index !== 8) {
          // Bend middle, ring, pinky down
          return { x: point.x, y: point.y + 0.25 };
        }
        return point;
      });
      
    default:
      // Return base landmarks with slight random variation
      return baseLandmarks.map(point => ({
        x: point.x + (Math.random() - 0.5) * 0.02,
        y: point.y + (Math.random() - 0.5) * 0.02
      }));
  }
};

// Generate landmarks that animate slightly for more realistic effect
export const generateAnimatedLandmarks = (gesture: string, time: number): Array<{x: number, y: number}> => {
  const baseLandmarks = generateMockHandLandmarks(gesture);
  
  // Add subtle animation (hand tremor/movement)
  return baseLandmarks.map((point, index) => ({
    x: point.x + Math.sin(time * 0.001 + index * 0.1) * 0.005,
    y: point.y + Math.cos(time * 0.001 + index * 0.15) * 0.005
  }));
};